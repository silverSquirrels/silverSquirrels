$(document).ready(function() {
  
  $('body').on('click', '.have', function(){
    console.log('clicked have')
  });

  $('body').on('click', '.want-to', function(){
    console.log('clicked want to')
  });

  $('body').on('click', 'h1', function(){
    console.log('clicked h1')
  });


});