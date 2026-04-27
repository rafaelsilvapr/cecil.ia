# Banco De Clips

## Objetivo
Guardar um catalogo vivo de recortes curtos que possam virar publicacao diaria sem perder rastreio de origem.

## Campos Minimos
- `clip_id`
- `source_video`
- `song`
- `block`
- `start_time`
- `end_time`
- `duration`
- `style`
- `energy`
- `platform`
- `status`
- `hook`
- `caption`
- `cta`
- `rights`
- `notes`

## Status Sugeridos
- `raw`
- `selected`
- `captioned`
- `approved`
- `scheduled`
- `published`
- `archived`

## Regra De Ouro
Um clip precisa dizer rapidamente:
- de onde veio
- o que mostra
- por que vale postar
- em que estado esta

## Template De Registro
| clip_id | source_video | song | block | start_time | end_time | duration | style | energy | platform | status | hook | caption | cta | rights | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Boa Pratica
Quando o clip entrar no banco, ja registrar a ideia de legenda no mesmo momento. Isso evita que o material fique parado sem contexto.
