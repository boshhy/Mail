document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


// This function will be used to create a new email
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display_email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector("#warning").innerHTML = '';

  // When a user submites the email form go to submit_form to handle request
  document.querySelector('#compose-form').addEventListener('submit', submit_form);
}


// This function will be used to display all email on screen
// This function works when mailbox = sent, inbox, archive
function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display_email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Use API to return the requested mailbox
  fetch('/emails/' + mailbox)
    .then(response => response.json())
    .then(email => {
      // Print email
      // For every email create a div to attach to the emails-view
      email.forEach((email) => {
        const div = document.createElement('div');
        // If email has been read change color to gray, else make it white
        if (email['read'] === true) {
          div.style.backgroundColor = "#D3D3D3";
        }
        else {
          div.style.backgroundColor = "#ffffff"
        }
        // When user hovers over an email div change color to light blue on hover
        div.addEventListener("mouseover", () => {
          div.style.cursor = 'pointer';
          div.style.backgroundColor = '#afcfee';
        })
        // When users moves is no longer hovering over email div
        // then change color back to gray or white
        div.addEventListener("mouseout", () => {
          if (email['read'] === true) {
            div.style.backgroundColor = "#D3D3D3";
          }
          else {
            div.style.backgroundColor = '#ffffff'
          }
        })

        // If the requested mailbox is 'sent' then the sender variable
        // will be used to display the email addresses that revieved the email
        // otherwise it will be used to display the 'inbox' and 'archive' sender
        if (mailbox === 'sent') {
          sender = email['recipients']
        }
        else {
          sender = email["sender"];
        }
        subject = email['subject'];
        time_sent = email['timestamp'];
        // If an email div has been clicked then display contents of email
        div.onclick = () => { display_email(email['id'], mailbox) }
        // The following is some styling for the email divs
        div.style.border = '1px solid black';
        div.style.margin = '6px';
        div.style.padding = '10px';
        div.style.borderRadius = '12px';
        // Divide div into 3 parts (sender/reciever, subject, time sent)
        div.innerHTML = `<span style="width: 250px;
                    margin-left: 8px;
                    display: inline-block;
                    vertical-align: bottom;
                    overflow: hidden;
                    text-overflow: ellipsis;"><b>${sender}</b></span>
                    <span>${subject}</span> 
                    <span style="float: right; margin-right: 8px;">${time_sent}</span>`;
        // Attach the div to the emails-view
        document.querySelector('#emails-view').append(div);
      })
    });
}


// This function will be used to display a single email to the user
// by using the emails id. Mailbox will be used to see if we need to display
// 'archive' and 'reply' buttons to user, since we should not be able to reply
// to 'sent' or 'archive' emails. only to 'inbox' emails
// This too will be used to display either a 'archive' or 'unarchive' button
function display_email(id, mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display_email').style.display = 'block';
  document.querySelector('#display_email').innerHTML = '';

  // Using the API get the email requested with the id
  // and change the read condition to 'true'
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  // Get the requested email with the id for displaying contents
  fetch('/emails/' + id)
    .then(response => response.json())
    // After getting the email contents and chaning to json display it to user
    .then(email => {
      sender = email.sender;
      recipients = email.recipients;
      subject = email.subject;
      timesent = email.timestamp;
      body = email.body;
      // Create a div for breaking up the page into sections
      const div = document.createElement('div');
      // The following will make a div for each section and break it up into two 
      // sections for a title and displaying contents. Using input tag for displaying
      // contents of the email so this should be disabled since only using for display
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

      // If the mailbox requested was 'input' add 'reply' and 'archive' buttons
      if (mailbox === 'inbox') {
        // Button to reply
        const button_reply = document.createElement('button');
        button_reply.innerHTML = "Reply";
        // Add event listener to 'reply' button
        button_reply.addEventListener('click', function () {
          // If user clicks reply button then use the reply_email function
          // passing in the email they would like to reply to
          reply_email(email);
        });
        // Style and append reply button
        button_reply.className = "btn btn-primary";
        button_reply.style.marginLeft = '74px';
        document.querySelector('#display_email').append(button_reply);

        // Button to archive
        const button_archive = document.createElement('button');
        button_archive.innerHTML = 'Archive';
        // Add event listener to archive button
        button_archive.addEventListener('click', function () {
          // Use API to get email with id and change archived to true
          fetch('/emails/' + id, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          })
            // Redirect user to the inbox after archived
            .then(() => {
              load_mailbox('inbox');
            })
            .catch(error => { console.log('Error:', error) });
        })
        // Style and append archive button
        button_archive.className = "btn btn-primary";
        button_archive.style.marginLeft = '8px';
        document.querySelector('#display_email').append(button_archive);
      }

      // If mailbox requested was 'archive' then the we need to display 
      // a button to 'unarchive'
      if (mailbox === 'archive') {
        // Button to unarchive
        const button_unarchive = document.createElement('button');
        button_unarchive.innerHTML = 'Unarchive';
        // Add event listener to 'unarchive' button
        button_unarchive.addEventListener('click', function () {
          // If user clicks button then use API to get mail and change 
          // the archived value to false
          fetch('/emails/' + id, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false
            })
          })
            // after setting emails archive value to false then
            // redirect the user to the inbox
            .then(() => {
              load_mailbox('inbox')
            })
            .catch(error => { console.log('Error:', error) });
        })
        // Add styling and append unarchive button
        button_unarchive.className = "btn btn-primary";
        button_unarchive.style.marginLeft = '74px';
        document.querySelector('#display_email').append(button_unarchive);
      }
    });
}


// This will be used to reply to an email
function reply_email(email) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#display_email').style.display = 'none';
  document.querySelector("#warning").innerHTML = '';

  // Get the values of the email that was passed in and used them
  // to prefill the value of the compose-email values
  document.querySelector('#compose-recipients').value = email.sender;
  // If email subject line starts with 'Re: ' then dont add it again, 
  // else add 'Re: ' to beggining of subject value
  if (email.subject.slice(0, 4) === "Re: ") {
    document.querySelector('#compose-subject').value = email.subject;
  }
  else {
    document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
  }
  document.querySelector('#compose-body').value = "\n\nOn " + email.timestamp + ' ' + email.sender + ' wrote:\n---> ' + email.body;
  // When user submits their email reply form, run the submit_form function
  document.querySelector('#compose-form').onsubmit = () => {
    submit_form();
  }
  return false;
}


// This will be used to get the values of the form and send email
function submit_form(event) {
  event.preventDefault();
  // Get all values of the form and save them into thier own variables
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Use API to post a new email to the users database
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    // Take the response and turn it into a json file
    .then(response => {
      return response.json()
    }
    )
    // Take the json file and see if an error occured
    .then(result => {
      if (result['error']) {
        document.querySelector("#warning").innerHTML = '<div class="alert alert-danger">' + result['error'] + '</div>';
      }
      // if not error go to the sent mailbox
      else {
        load_mailbox('sent');
      }
    })
    .catch(error => {
      console.log("catch");
      console.log(error);
    });
}
