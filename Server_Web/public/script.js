$(document).ready(function(){
	var socket = io("http://localhost:3000");

	$('.chat_head').click(function(){
		$('.chat_body').slideToggle('slow');
	});
	$('.msg_head').click(function(){
		$('.msg_wrap').slideToggle('slow');
	});
	$('.close').click(function(){
		$('.msg_box').hide();
	});
	$('#setNick').submit(function(){
				socket.emit('new user', $('#nickName').val());
                console.log('status Ok');

				$('#nickWrap').hide();
				$('.chat_box').show();

			    return false;
	});

	function usernameClick(){
	$('.user').click(function(){
		console.log($(this).text()); // User name

		$('.msg_box').show();
		$('#box_name').html($(this).text());

        $.ajax({url: "http://localhost:3000/messageForUser", 
                type: 'GET', 
                data:{collectionName: $('#nickName').val() + '_' + $(this).text()}, 
                success: function(result){
                    console.log('Ket qua tra ve: ' + result);
                }});
		
	});
	}
	usernameClick();

	socket.on('usernames', function(data){
			console.log(data);
			var html = '';
				for (i = 0; i < data.length; i ++){
                    if(data[i] !== $('#nickName').val()){    
				        html +='<div class="user" name="'+ data[i]+'">'+ data[i]+'</div>';
                    }
				}

				console.log(html);
				$('.chat_body').html(html);
				usernameClick();
	});

    socket.on('user joined', function(data){
        console.log(data);
        var html = '<div class="user" name="'+ data +'">' + data + '</div>';
        $('.chat_body').append(html);
        usernameClick();
    });


	$('textarea').keypress(function(e){
    	// e.preventDefault();

        if (e.keyCode == 13) {
        	var msg = $(this).val();
        	$(this).val('');
        	socket.emit('private message', msg, $('#box_name').text());
        }
    });

	socket.on('new message', function(data){

			console.log('Tu ' + data.sender + ' Gui toi ' + data.reciever + ' tin nhan: ' + data.msg);
            if($('#nickName').val() === data.reciever){
                $('.msg_box').show();
		        $('#box_name').html(data.sender);
            }
            if(data.dif === true){
                $('.msg_box').show();
		        $('#box_name').html(data.reciever);
            }
			if (data.sender == $('#box_name').text() ){
			    $('<div class="msg_b"><b>'+data.sender+': </b>'+data.msg+'</div>').insertBefore('.msg_push');
			    $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
			}else{
			    $('<div class="msg_a"><b>'+data.sender+': </b>'+data.msg+'</div>').insertBefore('.msg_push');
			    $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
			}

		});

});
