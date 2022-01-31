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
          div.style.backgroundColor = "#D3D3D3";
        }
        else {
          div.style.backgroundColor = "#ffffff"
        }
        div.addEventListener("mouseover", () => {
          div.style.cursor = 'pointer';
          div.style.backgroundColor = '#afcfee';
        })
        div.addEventListener("mouseout", () => {
          if (email['read'] === true) {
            div.style.backgroundColor = "#D3D3D3";
          }
          else {
            div.style.backgroundColor = '#ffffff'
          }
        })
        if (mailbox === 'sent') {
          sender = email['recipients']
        }
        else {
          sender = email["sender"];
        }
        recipients = email['recipients'];
        subject = email['subject'];
        time_sent = email['timestamp'];
        div.onclick = () => { display_email(email['id'], mailbox) }
        div.style.border = '1px solid black';
        div.style.margin = '6px';
        div.style.padding = '10px';
        div.style.borderRadius = '12px';
        div.innerHTML = `<span style="width: 250px;
                    margin-left: 8px;
                    display: inline-block;
                    vertical-align: bottom;
                    overflow: hidden;
                    text-overflow: ellipsis;"><b>${sender}</b></span>
                    <span>${subject}</span> 
                    <span style="float: right; margin-right: 8px;">${time_sent}</span>`
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
      div.innerHTML = `
          <div style="margin: 8px;">
              <span style="width: 64px; display: inline-block;"><b>From:</b></span>
              <input style="width: 90%;" disabled value="${sender} [${timesent}]">
          </div>
   
          <div style="margin: 8px;">
              <span style="width: 64px; display: inline-block;"><b>To:</b> </span>
              <input style="width: 90%;" disabled value="${recipients}">
          </div>
          <div style="margin: 8px;">
              <span style="width: 64px; display: inline-block;"><b>Subject:</b> </span>
              <input style="width: 90%;" disabled value="${subject}">
          </div>
          <div style="margin: 8px;">
              <span style="width: 64px; display: inline-block; vertical-align: top;"><b>Email:</b></span>
              <textarea style="width: 90%; height: 50vh" disabled placeholder="${body}"></textarea>
          </div>
          `;
      document.querySelector('#display_email').append(div);

      if (mailbox === 'inbox') {
        const button_reply = document.createElement('button');
        button_reply.innerHTML = "Reply";
        button_reply.addEventListener('click', function () {
          reply_email(email);
        });
        button_reply.className = "btn btn-primary";
        button_reply.style.marginLeft = '74px';

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
        button_archive.className = "btn btn-primary";
        button_archive.style.marginLeft = '8px';

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
        button_unarchive.className = "btn btn-primary";
        button_unarchive.style.marginLeft = '74px';
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
    .then(response => response.json())
    .then(() => {
      load_mailbox('sent')
    });
}