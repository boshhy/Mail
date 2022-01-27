document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display_email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // A user submits an email form
  document.querySelector('#compose-form').onsubmit = () => {
    submit_form();
  }
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display_email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(email => {
      // Print email
      //console.log(email);
      email.forEach((email) => {
        const div = document.createElement('div');
        console.log(email);
        if (email['read'] === true) {
          div.style.backgroundColor = "#aaaaaa";
        }
        sender = email["sender"];
        recipients = email['recipients'];
        subject = email['subject'];
        time_sent = email['timestamp'];
        div.innerHTML = 'Sender: ' + sender + ' --- recipients: ' + recipients + ' --- Subject: ' + subject + ' --- Date: ' + time_sent;
        div.onclick = () => { display_email(email['id'], mailbox) }
        div.style.border = '1px solid black';
        div.style.margin = '8px';
        document.querySelector('#emails-view').append(div);
      })
    });
}


function display_email(id, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display_email').style.display = 'block';
  document.querySelector('#display_email').innerHTML = '';


  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
      // Print email
      // console.log(email);
      sender = email.sender;
      recipients = email.recipients;
      subject = email.subject;
      timesent = email.timestamp;
      body = email.body;
      const div = document.createElement('div');
      // div.className = 'form-group';
      div.innerHTML = 'From: ' + sender + '<br>Recipients: ' + recipients + '<br>Subject: ' + subject + '<br>Time: ' + timesent + '<br>Body: ' + body;
      document.querySelector('#display_email').append(div);

      if (mailbox === 'inbox') {
        const button_reply = document.createElement('button');
        button_reply.innerHTML = "Reply";
        button_reply.addEventListener('click', function () {
          reply_email(email);
        });
        document.querySelector('#display_email').append(button_reply);
        const button_archive = document.createElement('button');
        button_archive.innerHTML = 'Archive';
        button_archive.addEventListener('click', function () {
          fetch('/emails/' + id, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          })
            .then(() => {
              load_mailbox('inbox');
            })
            .catch(error => { console.log('Error:', error) });
        })
        document.querySelector('#display_email').append(button_archive);
      }

      if (mailbox === 'archive') {
        const button_unarchive = document.createElement('button');
        button_unarchive.innerHTML = 'Unarchive';
        button_unarchive.addEventListener('click', function () {
          fetch('/emails/' + id, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false
            })
          })
            .then(() => {
              load_mailbox('inbox')
            })
            .catch(error => { console.log('Error:', error) });
        })
        document.querySelector('#display_email').append(button_unarchive);
      }
    });
}

function reply_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display_email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.slice(0, 4) === "Re: ") {
    document.querySelector('#compose-subject').value = email.subject;
  }
  else {
    document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
  }
  document.querySelector('#compose-body').value = "\n\nOn " + email.timestamp + ' ' + email.sender + ' wrote:\n---> ' + email.body;
  console.log(email.recipients);
  document.querySelector('#compose-form').onsubmit = () => {
    submit_form();
  }
}

function submit_form() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    // This is broken TODO: fix
    .then(response => response.json())
    .then(result => {

      load_mailbox('sent')

    });
}