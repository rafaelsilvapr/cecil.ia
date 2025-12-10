from googleapiclient.discovery import build

def get_unread_emails(creds, max_results=10):
    """Fetches subjects of the latest unread emails."""
    service = build('gmail', 'v1', credentials=creds)

    # Call the Gmail API to list messages
    results = service.users().messages().list(userId='me', q='is:unread', maxResults=max_results).execute()
    messages = results.get('messages', [])

    email_subjects = []
    if not messages:
        print('No unread messages found.')
    else:
        for message in messages:
            msg = service.users().messages().get(userId='me', id=message['id']).execute()
            headers = msg['payload']['headers']
            subject = next((header['value'] for header in headers if header['name'] == 'Subject'), 'No Subject')
            email_subjects.append(subject)

    return email_subjects
