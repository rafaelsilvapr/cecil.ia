from googleapiclient.discovery import build

def get_tasks(creds, use_mock=False):
    """Fetches tasks from Google Tasks API or returns mock data."""
    if use_mock:
        return [
            {'title': 'Preparar aula de IA', 'status': 'needsAction'},
            {'title': 'Revisar artigo para conferência', 'status': 'needsAction'},
            {'title': 'Comprar ração do cachorro', 'status': 'needsAction'}
        ]

    service = build('tasks', 'v1', credentials=creds)

    # Call the Tasks API
    results = service.tasklists().list(maxResults=10).execute()
    items = results.get('items', [])

    if not items:
        print('No task lists found.')
        return []

    # Get tasks from the first task list
    tasklist_id = items[0]['id']
    results = service.tasks().list(tasklist='@default', showCompleted=False, maxResults=10).execute()
    tasks = results.get('items', [])
    
    return tasks
