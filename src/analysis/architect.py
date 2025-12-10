import datetime
from collections import Counter

def analyze_day(events, tasks, emails):
    """
    Analyzes the day's events, tasks, and emails to determine the theme and status.
    """
    
    # 1. Calculate Total Meeting Time
    total_meeting_minutes = 0
    keywords = []

    for event in events:
        # Calculate duration
        start = event['start'].get('dateTime', event['start'].get('date'))
        end = event['end'].get('dateTime', event['end'].get('date'))
        
        # Simple parsing for ISO format
        try:
            start_dt = datetime.datetime.fromisoformat(start.replace('Z', '+00:00'))
            end_dt = datetime.datetime.fromisoformat(end.replace('Z', '+00:00'))
            duration = (end_dt - start_dt).total_seconds() / 60
            total_meeting_minutes += duration
        except ValueError:
            pass # All-day events might not have time, ignore for "meeting hours" calculation

        # Extract keywords from summary
        summary = event.get('summary', '').lower()
        keywords.extend(summary.split())

    # 2. Extract keywords from Tasks and Emails
    for task in tasks:
        keywords.extend(task.get('title', '').lower().split())
    
    for subject in emails:
        keywords.extend(subject.lower().split())

    # 3. Determine Theme
    # Filter out common stop words (basic list for Portuguese/English)
    stop_words = {'e', 'de', 'do', 'da', 'para', 'com', 'a', 'o', 'que', 'em', 'um', 'uma', 
                  'and', 'of', 'to', 'in', 'for', 'with', 'the', 'a', 'an', 'is', 'on', 'at',
                  'reunião', 'meeting', 'aula', 'class', 'trabalho', 'work'}
    
    filtered_keywords = [k for k in keywords if k not in stop_words and len(k) > 3]
    
    if filtered_keywords:
        common_words = Counter(filtered_keywords).most_common(3)
        theme = common_words[0][0].capitalize() if common_words else "Produtividade Geral"
    else:
        theme = "Organização e Planejamento"

    # 4. Check Survival Mode
    survival_mode = total_meeting_minutes > 240 # > 4 hours

    return {
        'theme': theme,
        'survival_mode': survival_mode,
        'total_meeting_minutes': total_meeting_minutes,
        'meeting_count': len(events),
        'task_count': len(tasks),
        'email_count': len(emails)
    }
