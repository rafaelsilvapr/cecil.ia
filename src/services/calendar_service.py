from googleapiclient.discovery import build
import datetime

def get_upcoming_events(creds, max_results=10):
    """Shows basic usage of the Google Calendar API.
    Prints the start and name of the next 10 events on the user's calendar.
    """
    service = build('calendar', 'v3', credentials=creds)

    # Call the Calendar API
    now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
    print(f'Getting the upcoming {max_results} events')
    events_result = service.events().list(calendarId='primary', timeMin=now,
                                          maxResults=max_results, singleEvents=True,
                                          orderBy='startTime').execute()
    events = events_result.get('items', [])

    if not events:
        print('No upcoming events found.')
        return []
    
    return events

def get_events_for_tomorrow(creds):
    """Fetches events specifically for tomorrow."""
    service = build('calendar', 'v3', credentials=creds)
    
    # Calculate tomorrow's range
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)
    start_time = datetime.datetime.combine(tomorrow, datetime.time.min).isoformat() + 'Z'
    end_time = datetime.datetime.combine(tomorrow, datetime.time.max).isoformat() + 'Z'
    
    print(f'Getting events for tomorrow: {tomorrow}')
    events_result = service.events().list(calendarId='primary', timeMin=start_time,
                                          timeMax=end_time, singleEvents=True,
                                          orderBy='startTime').execute()
    return events_result.get('items', [])
