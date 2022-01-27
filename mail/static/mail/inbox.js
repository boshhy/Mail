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
  document.querySelector('#compose-body').value = 'test';

  // A user submits an email form
  document.querySelector('#compose-form').onsubmit = () => {
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
      console.log(email);
      email.forEach((email) => {
        const div = document.createElement('div');
        sender = email["sender"];
        recipients = email['recipients'];
        subject = email['subject'];
        time_sent = email['timestamp'];
        div.innerHTML = 'Sender: ' + sender + ' --- recipients: ' + recipients + ' --- Subject: ' + subject + ' --- Date: ' + time_sent;
        div.onclick = () => { display_email(email['id']) }
        div.style.border = '1px solid black';
        div.style.margin = '8px';
        document.querySelector('#emails-view').append(div);
      })
    });
}


function display_email(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  //document.querySelector('#items').style.display = 'none';
  document.querySelector('#display_email').style.display = 'block';

  document.querySelector('#display_email').innerHTML = '';

  fetch('/emails/' + id)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);
      sender = email.sender;
      recipients = email.recipients;
      subject = email.subject;
      timesent = email.time;
      body = email.body;
      const div = document.createElement('div');
      div.innerHTML = 'email shoul be displayed here';
      document.querySelector('#display_email').append(div);


      // ... do something else with email ...
    });
}
