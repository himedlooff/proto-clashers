
function getGithubData(repo, editor) {
  $.get('https://api.github.com/repos/himedlooff' + repo + '/commits')
    .done(function(data){
      buildHTML(data, editor);
    });
}

function buildHTML(data, editor) {

  //console.log(data);
  var i = 0,
      total = data.length,
      $latestCommit = $(),
      $commits = $();

  var $postHistory = $(
    '<div class="post-history">' +
      '<div class="wrapper">' +
        '<ul class="post-history-list"></ul>' +
        '<p class="post-history-more"><a href="#">See the full history</a></p>' +
      '</div>' +
    '</div>'
  );

  var $latestHistoryItem = $(
    '<p class="post-history-list_item">' +
      '<span class="post-history-message">' +
        '<span class="post-history-date token"></span>' +
      '</span> ' +
    '</p>');

  for ( i; i < total; i++ ) {

    var $historyListItem = $(
      '<li class="post-history-list_item">' +
        '<span class="post-history-message">' +
          '<span class="post-history-date token"></span>' +
        '</span> ' +
      '</li>');

    var latestLabel = '<span class="post-history-latest-label token">Latest update</span> ';

    var commitMessage = cleanCommitMessage(data[i].commit.message);

    var timeStr = data[i].commit.committer.date;
    var date = new Date(timeStr);
    var day = date.getDate();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var dateStr = '<span class="post-history-date-month-day">' + month + '-' + day + '</span>' + '-' +
                  '<span class="post-history-date-year">' + year + '</span>';

    var $item = (i === 0) ? $latestHistoryItem : $historyListItem;

    //console.log(data[i].commit.message);
    //console.log(dateStr);

    $item.find('.post-history-message').append(commitMessage);
    $item.find('.post-history-date').append(dateStr);


    if (data[i].commit.author.name === editor) {

      if (i === 0) {
        $item.find('.post-history-message').prepend(latestLabel);
      } else {
        $commits = $commits.add( $item );
      }

    }

  }

  $postHistory.find('.wrapper').prepend($latestHistoryItem);
  $postHistory.find('.post-history-list').html($commits);

  $('[role="main"]').prepend($postHistory);

  $('.post-history-more').click(function(e){
    e.preventDefault();
    $('.post-history-list').slideToggle();
  });

}

function cleanCommitMessage(str) {
  var newStr = str;
  newStr = removePeriod(newStr);
  newStr = editText(newStr);
  return newStr;
}

function editText(str) {
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
