set src to POSIX file "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/projetos/websites/rafaeldasilva-pro/Relatorio_Auditoria_YouTube_Rafael_Base_Preenchida.xlsx"
set dst to POSIX file "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Prof. Rafael"

tell application "Finder"
    duplicate src to dst with replacing
end tell
