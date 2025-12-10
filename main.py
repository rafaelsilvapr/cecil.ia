import os
from src.auth import authenticate_google_apis
from src.services.calendar_service import get_events_for_tomorrow
from src.services.tasks_service import get_tasks
from src.services.gmail_service import get_unread_emails
from src.services.youtube_service import search_video
from src.analysis.architect import analyze_day

def main():
    print("🤖 Iniciando Agente de Planejamento Matinal...")
    
    # 1. Authenticate
    try:
        creds = authenticate_google_apis()
    except Exception as e:
        print(f"❌ Erro na autenticação: {e}")
        return

    # 2. Fetch Data
    print("\n📅 Buscando dados do Google...")
    events = get_events_for_tomorrow(creds)
    tasks = get_tasks(creds, use_mock=True) # Using mock for now as requested
    emails = get_unread_emails(creds)

    # 3. Analyze
    print("\n🧠 Analisando sua rotina...")
    analysis = analyze_day(events, tasks, emails)

    # 4. Get Content
    print(f"\n🎥 Buscando inspiração sobre: {analysis['theme']}...")
    video = search_video(creds, f"{analysis['theme']} educational video")

    # 5. Generate Output
    print("\n" + "="*40)
    print(f"🌞 BRIEFING MATINAL - {analysis['theme'].upper()}")
    print("="*40)
    
    if analysis['survival_mode']:
        print("\n⚠️  ALERTA: MODO DE SOBREVIVÊNCIA ATIVADO")
        print(f"   Você tem {analysis['total_meeting_minutes']/60:.1f} horas de compromissos agendados.")
        print("   Foco total em energia e pausas estratégicas.")
    else:
        print("\n✅  Dia Equilibrado")
        print(f"   Carga horária de reuniões: {analysis['total_meeting_minutes']/60:.1f}h")

    print("\n📊  Resumo:")
    print(f"   • Eventos Amanhã: {analysis['meeting_count']}")
    print(f"   • Tarefas Pendentes: {analysis['task_count']}")
    print(f"   • E-mails Não Lidos: {analysis['email_count']}")

    if video:
        print("\n📺  Vídeo Recomendado para o Tema:")
        print(f"   {video['title']}")
        print(f"   {video['url']}")
    else:
        print("\n📺  Nenhum vídeo específico encontrado.")

    print("\n🚀  Tenha um excelente dia!")
    print("="*40)

if __name__ == '__main__':
    main()
