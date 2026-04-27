# Base de dados

Esta pasta guarda os arquivos estruturados para analise da disciplina.

## Arquivos principais

- `schema.sql`: definicao do banco relacional
- `students.csv`: cadastro da turma
- `assessments.csv`: componentes avaliativos
- `questions.csv`: banco de questoes
- `answer_key.csv`: gabarito por questao
- `student_answers.csv`: respostas por aluno e por questao
- `grades.csv`: notas consolidadas

## Regra de ouro

Cada resposta de aluno deve virar uma linha estruturada, de forma que seja possivel filtrar por:

- aluno
- questao
- prova
- pedagogia
- acerto ou erro
- pontuacao

## Convencao

- Use `assessment_id` como chave primaria logica.
- Use `student_id` para identificacao interna.
- Use `question_number` para a numeracao exibida na prova.
- Use `correct_option` para questoes objetivas.
- Use `notes` para observacoes de correcao.
