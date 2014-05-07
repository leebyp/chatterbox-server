// YOUR CODE HERE:
var app = {};


//gets data from server, extracts data.results, which is an array, containing all objects that inturn contain all relevant chat data: (createdAt, objectId, roomname, text, updatedAt, username). This is the data that we use to display in our chatroom.
app.fetch = function(){
  $.ajax({
    url: "http://127.0.0.1:5000/classes/messages",   //show most recent messages
    type: "GET",
    dataType: "json",
    success: function(data){
      console.log ("data", data);
      console.log(typeof(data));
      console.log("updating correctly with fetch");
      app.data = data.results;      //array of message objects
      app.display(app.particular, app.currentDisplayType);    //refresh messages: app.particular will determine the element that app.currentDisplayType is referring to
      app.updateRooms();    //updates the rooms with the new message data
      app.updateUsers();    //updates the users with the new message data
    }
  });
};


//this will display chats for particular rooms/people
app.display = function(particular, type){

  $('.chat ul li').remove();    //remove all previous chats

  for (var i=0; i<app.data.length; i++){    //breaks up elements from the app.data array to place into chats

    var instance = app.data[i];
    var createdAt = $('<li/>').text(instance.createdAt).html();
    var roomname = $('<li/>').text(instance.roomname).html();
    var text = $('<li/>').text(instance.text).html();
    var username = $('<li/>').text(instance.username).html();
    var message = '<li>' + username + ': ' + text + '<br>' + createdAt + '</li>';   //collated chat message

    if (type === 'room'){
      //print only messages from that room
      if (instance.roomname === particular){
        $('.chat ul').append(message)
      }
    }
    else if (type === 'person'){
      //print only messages from that person
      if (instance.username === particular){
        $('.chat ul').append(message)
      }
    }
    else if (type === 'all'){
      //print all messages
      $('.chat ul').append(message);
    }

  }

};

//sends data to server
app.send = function(data){
  console.log(data);
  $.ajax({
    url: "http://127.0.0.1:5000/classes/messages",
    type: 'POST',
    data: JSON.stringify(data),
    contentType: "application/json",
    success: function(){
      console.log('sending correctly with send');
      app.display(app.particular, app.currentDisplayType);
    }
  });

};

//updates user list based on current messages
app.updateUsers = function(){

  $('.users ul li').remove();

  var users = [];
  for (var i=0; i<app.data.length; i++){
    var instance = app.data[i];
    var username = '<li>'+ $('<li/>').text(instance.username).html() + '</button></li>';
    users.push(username);
  }
  users = _.uniq(users);
  for (var i=0; i<users.length; i++){
    $('.users ul').append(users[i]);
  }
};

//updates room list based on current messages
app.updateRooms = function(){

  $('.rooms ul li').remove();

  var rooms = [];
  for (var i=0; i<app.data.length; i++){
    var instance = app.data[i];
    var roomname = '<li>' + $('<li/>').text(instance.roomname).html() + '</li>';
    rooms.push(roomname);
  }
  rooms = _.uniq(rooms);
  for (var i=0; i<rooms.length; i++){
    $('.rooms ul').append(rooms[i]);
  }
};

//initializes the whole app, data-fetching and refreshing page every 5 seconds
app.init = function(){
  var self = this;
  app.fetch();
  setInterval(function(){
    self.fetch();
  }, 5000);
};

app.friends = [];

app.currentDisplayType = 'all';
app.particular = undefined;



$(document).ready(function(){

  app.init();

  $('.users ul').on('click','li', function(){       //adds user to friends list if not already friend
    var alreadyFriend = false;

    var newFriend = '<li>' + $(this).text() + '</li>';
    for (var i=0; i<app.friends.length; i++){
      if (app.friends[i] === newFriend){
        return alreadyFriend = true;
      }
    }
    if (!alreadyFriend){
      app.friends.push(newFriend);
      $('.friends ul').append(newFriend);
    }
  });

  $('.friends ul').on('click','li', function(){     //changes display to friend's messages when clicked
    app.currentDisplayType = 'person';
    app.particular = String($(this).text());
    app.display(app.particular, app.currentDisplayType);
    $('.chat p').text('CurrentRoom: all, UserMessages: '+app.particular);
  });

  $('.rooms ul').on('click','li', function(){       //changes display to room's messages when clicked
    app.currentDisplayType = 'room';
    app.particular = String($(this).text());
    app.display(app.particular, app.currentDisplayType);
    $(".chat p").text('CurrentRoom: '+app.particular+', UserMessages: all');
  });

  $('#main h1').on('click', function(){             //changes display to all messages when clicked
    app.currentDisplayType = 'all';
    app.display(app.particular, app.currentDisplayType);
    $('.chat p').text('CurrentRoom: all, UserMessages: all');
  });

  $('#newmessagebutton').on('click', function(){    //sends message to the server when submit button clicked
    var text = $('#newmessagetext').val();
    var room = $('#newmessageroom').val();
    var user = $('#newmessageuser').val();
    var message = {
      username: user,
      text: text,
      roomname: room
    };
    app.send(message);
  })

  $('#newmessageuser').on('keyup', function(e){   //triggers message send when enter is pressed on last textinput
    if (e.keyCode === 13){
      $('#newmessagebutton').trigger('click');
    }
  })

})
