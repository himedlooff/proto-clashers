
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

  if ($(window).width() > 48 * 16) {
    $('#post-nav').sticky({
      topSpacing: 0,
      getWidthFrom: '#post-nav_wrapper'
    });
  }

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

  // Initializes the creation and placement of the hitory list and history list events.

  // First scrub the commit history and filter it to commits from the editor
  var scrubbedData = scrubGithubCommits(data, editor);

  // Create the history list and insert it into the dom.
  $('[role="main"]').prepend(
    '<div class="history">' +
      '<div class="wrapper">' +
        makeLatestHistoryItem(scrubbedData[0]) +
        '<ul class="history-list">' +
          makeHistoryItemList(scrubbedData) +
        '</ul>' +
      '</div>' +
    '</div>')
    .children('.history')
    .fadeTo(0,0)
    .fadeTo(750,1);
  
  // Expand the history list on click
  $('.history-more').click(function(e){
    e.preventDefault();
    $('.history-list').slideToggle();
  });

}

function makeHistoryItemList(data) {

  // Expects github api data for a repos commits, and the string of the username to filter the commits by.
  // Returns a string representing html for all but the first filtered commits.

  var total = data.length,
      historyList = '';

  // Loop through the data source starting from the second item and create a history item string
  // representing html. Append them together to screate a master list of all history items.
  for ( var i = 1; i < total; i++ ) {
    historyList += makeHistoryItem(
      data[i],
      '<li class="history-list_item">' +
        '<span class="history-message">' +
          '<span class="history-date token"></span>' +
        '</span> ' +
      '</li>'
    );
  }

  return historyList;

}

function makeHistoryItem(commitData, template) {

  // Expects github api data for a single repo commit, and a string to use as an html template.
  // Returns a string representing html for the commit.

  var $template = $(template);
  var commitMessage = commitData.commit.message;
  var timeStr = commitData.commit.committer.date;
  var date = new Date(timeStr);
  var day = date.getDate();
  var year = date.getFullYear().toString().substr(2,2);
  var month = date.getMonth()+1;
  var dateStr = '<span class="history-date-month-day">' + month + '-' + day + '</span>' + '-' +
                '<span class="history-date-year">' + year + '</span>';

  $template.find('.history-message').append(commitMessage);
  $template.find('.history-date').append(dateStr);

  return $('<div>').append($template.clone()).html();

}

function makeLatestHistoryItem(firstCommitData) {

  // Expects github api data for a single repo commit.
  // Returns a string representing html for the commit.

  return makeHistoryItem(
    firstCommitData,
    '<p class="history-latest history-list_item">' +
      '<span class="token-group token-group-stacked">' +
        '<span class="history-latest-label token token__dark token-group_item token-group-stacked_item">Latest</span> ' +
        '<span class="history-date token token-group_item token-group-stacked_item"></span>' +
      '</span> ' +
      '<span class="history-message"></span> ' +
      '<span class="history-more"><a href="#">See the full history</a></span>' +
    '</p>'
  );

}

function scrubGithubCommits(data, editor) {

  var total = data.length,
      scrubbedData = [];

  // Loop through the commits
  for ( var i = 0; i < total; i++ ) {
    if (data[i].commit.author.name === editor) {
      // Clean the message removing certain phrases
      data[i].commit.message = cleanCommitMessage(data[i].commit.message);
      // Add the scrubbed data to the scrubbed array
      scrubbedData.push(data[i]);
    }
  }

  return scrubbedData;
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
