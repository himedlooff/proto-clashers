
/* ==========================================================================
   Proto-clashers page enhancements
   ========================================================================== */

function initPage(repo, editor) {

  // This function initializes all of the enhancements for the page

  // Create a table of contents nav from the h1 elements in .post-content
  initTOCNav();

  // Add table of content links before each h1 in .post-content
  initTOCLinks();

  // Build a history list using commit messages from github
  $.get('https://api.github.com/repos/himedlooff' + repo + '/commits')
    .done(function(data){
      initHistoryList(data, editor);
    });

}

/* ==========================================================================
   Table of contents nav
   ========================================================================== */

function initTOCNav() {

  // Creates and inserts a table of contents nav

  $('.post').after(
    '<div class="l-side" id="post-nav_wrapper">' +
      '<div class="post-nav" id="post-nav">' +
        '<h1 class="post-nav-label" id="table-of-contents">Table of contents</h1>' +
        '<ul class="post-nav-list">' +
          makeTOCNav() +
        '</ul>' +
      '</div>' +
    '</div>'
  );

  $('#post-nav').sticky({
    topSpacing: 0,
    getWidthFrom: '#post-nav_wrapper'
  });

}

function makeTOCNav() {

  // Returns a string representing html for the table of contents nav.

  var navItems = '';

  // Make a nav item html string for each h1 element
  // in .post-content and append it to navItems.
  $('.post-content h1').each(function(){
    navItems += makeTOCNavItem(this);
  });

  return navItems;

}

function makeTOCNavItem(headingElement) {

  // Expects a dom element and returns a string representing html

  var $h = $(headingElement);

  return '' +
    '<li class="nav-list_item">' +
      '<a href="#' + $h.attr('id') + '" class="post-nav-list-item-link">' +
        $h.text() +
      '</a>' +
    '</li>';

}

/* ==========================================================================
   Table of contents links
   ========================================================================== */

function initTOCLinks() {

  // Inserts a link to the table of contents nav before each h1 element in .post-content

  var tocLink = '' +
        '<p class="toc-nav-jump-link">' +
          '<a href="#table-of-contents" class="token token__light">' +
            'Table of Contents' +
          '</a>' +
        '</p>';

  $('.post-content h1').each(function(index){
    if (index > 0) {
      $(this).before(tocLink);
    }
  });

}

/* ==========================================================================
   History list
   ========================================================================== */

function initHistoryList(data, editor) {

  var $postHistory = $(
    '<div class="post-history">' +
      '<div class="wrapper">' +
        makeLatestHistoryItem(data[0]) +
        '<ul class="post-history-list">' +
          makeHistoryList(data, editor) +
        '</ul>' +
      '</div>' +
    '</div>'
  );

  $('[role="main"]').prepend($postHistory);

  $('.post-history-more').click(function(e){
    e.preventDefault();
    $('.post-history-list').slideToggle();
  });

  $postHistory.slideToggle();

}

function makeHistoryList(data, editor) {

  var i = 1, //Start at the second item
      total = data.length,
      historyList = '';

  for ( i; i < total; i++ ) {
    if (data[i].commit.author.name === editor) {
      historyList += makeHistoryItem(
        data[i],
        '<li class="post-history-list_item">' +
          '<span class="post-history-message">' +
            '<span class="post-history-date token"></span>' +
          '</span> ' +
        '</li>'
      );
    }
  }

  return historyList;

}

function makeHistoryItem(commitData, template) {

  var $template = $(template);
  var commitMessage = cleanCommitMessage(commitData.commit.message);
  var timeStr = commitData.commit.committer.date;
  var date = new Date(timeStr);
  var day = date.getDate();
  var year = date.getFullYear().toString().substr(2,2);
  var month = date.getMonth()+1;
  var dateStr = '<span class="post-history-date-month-day">' + month + '-' + day + '</span>' + '-' +
                '<span class="post-history-date-year">' + year + '</span>';

  $template.find('.post-history-message').append(commitMessage);
  $template.find('.post-history-date').append(dateStr);

  return $('<div>').append($template.clone()).html();

}

function makeLatestHistoryItem(firstCommitData) {

  return makeHistoryItem(
    firstCommitData,
    '<p class="post-history-latest post-history-list_item">' +
      '<span class="token-group token-group-stacked">' +
        '<span class="post-history-latest-label token token__dark token-group_item token-group-stacked_item">Latest</span> ' +
        '<span class="post-history-date token token-group_item token-group-stacked_item"></span>' +
      '</span> ' +
      '<span class="post-history-message"></span> ' +
      '<span class="post-history-more"><a href="#">See the full history</a></span>' +
    '</p>'
  );

}

function cleanCommitMessage(str) {
  var newStr = str;
  newStr = removePeriod(newStr);
  newStr = removePhrases(newStr);
  return newStr;
}

function removePhrases(str) {
  return str.replace('Update index.md', '');
}

function removePeriod(str) {
  var lastCharacter = str.substring(str.length - 1);
  if ( lastCharacter === '.' ) {
    return str.substring(0, str.length - 1);
  } else {
    return str;
  }
}
