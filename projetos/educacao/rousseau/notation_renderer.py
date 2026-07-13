"""
Renderizador de Notação - Sistema Rousseau
Gera visualizações SVG e PDF da notação musical.
"""

import svgwrite
from svgwrite import cm, mm
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm as pdf_mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
from chord_database import format_chord_vertical


class NotationRenderer:
    """Renderiza notação Rousseau em SVG e PDF."""

    def __init__(self, time_signature="4/4"):
        """
        Inicializa o renderizador.

        Args:
            time_signature: fórmula de compasso

        Nota: O sistema Rousseau usa graus relativos (1-7),
        independente da tonalidade absoluta.
        """
        self.time_signature = time_signature
        self.beats_per_measure = int(time_signature.split('/')[0])

        # Dimensões
        self.measure_width = 120
        self.measure_height = 80
        self.margin_top = 20
        self.margin_left = 20

        # Estilos

        # Fontes
        self.font_size_chord = 16
        self.number_font_size = 14
        self.syllable_font_size = 12
        self.color_harmony = "#0b3d59"

    def format_octave_mark(self, note_number, octave):
        """
        Adiciona marcação de oitava a um número.

        Args:
            note_number: str (1-7, pode ter # ou b)
            octave: "up", "normal", "down"

        Returns:
            str com marcação Unicode
        """
        if octave == "up":
            return f"{note_number}̄"
        elif octave == "down":
            return f"{note_number}̱"
        return note_number

    def render_system_svg(self, measures, system_index, start_measure_idx):
        """
        Renderiza um sistema (pauta) inteiro em SVG.
        """
        system_group = svgwrite.container.Group(id=f"system_{system_index}")

        # Dimensões do sistema
        width_mm = 170
        height_mm = 45

        measures_count = len(measures)
        measure_width = width_mm / 4

        # Posições verticais dentro do sistema
        y_chord = 10
        y_staff_top = 20
        y_melody = 27
        y_staff_bottom = 35
        y_lyrics = 43

        # Linha superior da pauta
        system_group.add(svgwrite.shapes.Line(
            start=(0, y_staff_top * mm),
            end=(measures_count * measure_width * mm, y_staff_top * mm),
            stroke='black', stroke_width=1
        ))

        # Linha inferior da pauta
        system_group.add(svgwrite.shapes.Line(
            start=(0, y_staff_bottom * mm),
            end=(measures_count * measure_width * mm, y_staff_bottom * mm),
            stroke='black', stroke_width=1
        ))

        # Barra de compasso esquerda
        system_group.add(svgwrite.shapes.Line(
            start=(0, y_staff_top * mm),
            end=(0, y_staff_bottom * mm),
            stroke='black', stroke_width=1
        ))

        # Barra de compasso direita
        system_group.add(svgwrite.shapes.Line(
            start=(measures_count * measure_width * mm, y_staff_top * mm),
            end=(measures_count * measure_width * mm, y_staff_bottom * mm),
            stroke='black', stroke_width=1
        ))

        for m_idx, measure in enumerate(measures):
            x_start = m_idx * measure_width

            # Barra de compasso entre compassos
            if m_idx > 0:
                system_group.add(svgwrite.shapes.Line(
                    start=(x_start * mm, y_staff_top * mm),
                    end=(x_start * mm, y_staff_bottom * mm),
                    stroke='black', stroke_width=1
                ))

            # Número do compasso
            system_group.add(svgwrite.text.Text(
                str(start_measure_idx + m_idx + 1),
                insert=((x_start + 1) * mm, (y_staff_top + 3) * mm),
                font_size=8, fill='#666'
            ))

            beats = measure.get('beats', [])
            beat_width = measure_width / self.beats_per_measure

            for b_idx, beat in enumerate(beats):
                center_x = x_start + b_idx * beat_width + beat_width / 2

                # Linha divisória de pulso (tracejada)
                if b_idx > 0:
                    system_group.add(svgwrite.shapes.Line(
                        start=((x_start + b_idx * beat_width) * mm, y_staff_top * mm),
                        end=((x_start + b_idx * beat_width) * mm, y_staff_bottom * mm),
                        stroke='#ccc', stroke_width=0.5, stroke_dasharray='2,2'
                    ))

                # Harmonia (acorde)
                if beat.get('harmony'):
                    system_group.add(svgwrite.text.Text(
                        beat['harmony'],
                        insert=(center_x * mm, y_chord * mm),
                        text_anchor='middle', font_size=14, font_weight='bold',
                        font_family='Times New Roman',
                        fill=self.color_harmony
                    ))

                    formation = format_chord_vertical(beat['harmony'])
                    if formation:
                        for s_idx, note in enumerate(reversed(formation)):
                            system_group.add(svgwrite.text.Text(
                                note,
                                insert=((center_x + 6) * mm, (y_chord + 1 - s_idx * 3) * mm),
                                font_size=8, font_family='Times New Roman', fill='#555'
                            ))

                # Melodia
                if beat.get('melody'):
                    melody_note = self.format_octave_mark(
                        beat['melody'], beat.get('octave', 'normal')
                    )
                    system_group.add(svgwrite.text.Text(
                        melody_note,
                        insert=(center_x * mm, y_melody * mm),
                        text_anchor='middle', font_size=20, font_weight='bold',
                        font_family='Times New Roman'
                    ))

                # Sílaba
                if beat.get('syllable'):
                    syl_text = beat['syllable']
                    color = 'black'
                    if beat.get('sinalefa'):
                        syl_text = syl_text.replace('~', '‿')
                        color = '#990000'

                    system_group.add(svgwrite.text.Text(
                        syl_text,
                        insert=(center_x * mm, y_lyrics * mm),
                        text_anchor='middle', font_size=10,
                        font_family='Helvetica', fill=color
                    ))

        return system_group

    def create_svg(self, grid_data, output_path=None):
        """
        Cria documento SVG completo com layout de SISTEMAS.
        """
        measures = grid_data.get('measures', [])
        measures_per_system = 4

        # Quantos sistemas serão necessários
        num_systems = (len(measures) + measures_per_system - 1) // measures_per_system

        # A4: 210mm de largura
        doc_width = 210 * mm

        system_height_total = 60
        doc_height = (40 + num_systems * system_height_total) * mm

        dwg = svgwrite.Drawing(
            filename=output_path,
            size=(doc_width, doc_height),
            profile='full'
        )

        # Título
        dwg.add(svgwrite.text.Text(
            f"Sistema Rousseau - {self.time_signature}",
            insert=(105 * mm, 20 * mm),
            text_anchor='middle', font_size=18, font_weight='bold',
            font_family='Helvetica'
        ))

        # Renderiza cada sistema
        for i in range(num_systems):
            start_idx = i * measures_per_system
            end_idx = min(start_idx + measures_per_system, len(measures))
            system_measures = measures[start_idx:end_idx]

            # Posição vertical do sistema
            y_pos = 40 + i * system_height_total

            system_group = self.render_system_svg(system_measures, i, start_idx)
            system_group.translate(20, y_pos)
            dwg.add(system_group)

        if output_path:
            dwg.save()
            return output_path

        return dwg.tostring()

    def create_pdf(self, grid_data, output_path):
        """
        Cria documento PDF com notação Rousseau em formato de SISTEMAS (Partitura).
        """
        c = canvas.Canvas(output_path, pagesize=A4)
        width, height = A4

        # Margens
        margin_left = 20 * pdf_mm
        margin_right = 20 * pdf_mm
        margin_top = 20 * pdf_mm
        margin_bottom = 20 * pdf_mm

        content_width = width - margin_left - margin_right

        # Layout dos sistemas
        system_height = 45 * pdf_mm
        measures_per_system = 4
        measure_width = content_width / measures_per_system

        # Posições verticais dentro de um sistema (a partir da base)
        y_chord = 35 * pdf_mm
        y_staff_top = 25 * pdf_mm
        y_melody = 18 * pdf_mm
        y_staff_bottom = 10 * pdf_mm
        y_lyrics = 2 * pdf_mm

        # Posição vertical inicial
        current_y = height - margin_top - 30

        # Título
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(width / 2, height - 25 * pdf_mm, "Sistema Rousseau")
        c.setFont("Helvetica", 12)
        c.drawCentredString(width / 2, height - 32 * pdf_mm, f"Compasso: {self.time_signature}")

        current_y -= 20 * pdf_mm

        measures = grid_data.get('measures', [])

        for idx, measure in enumerate(measures):
            system_index = idx % measures_per_system

            if system_index == 0:
                # Novo sistema
                current_y -= system_height

                # Nova página se necessário
                if current_y < margin_bottom:
                    c.showPage()
                    current_y = height - margin_top - system_height

            x_start = margin_left + system_index * measure_width

            # === PAUTA (linhas horizontais) ===
            c.setLineWidth(1)
            c.setStrokeColorRGB(0, 0, 0)

            # Linha superior
            c.line(x_start, current_y + y_staff_top,
                   x_start + measure_width, current_y + y_staff_top)
            # Linha inferior
            c.line(x_start, current_y + y_staff_bottom,
                   x_start + measure_width, current_y + y_staff_bottom)
            # Barra esquerda
            c.line(x_start, current_y + y_staff_bottom,
                   x_start, current_y + y_staff_top)
            # Barra direita
            c.line(x_start + measure_width, current_y + y_staff_bottom,
                   x_start + measure_width, current_y + y_staff_top)

            # Número do compasso
            c.setFont("Helvetica", 8)
            c.setFillColorRGB(0.4, 0.4, 0.4)
            c.drawString(x_start + 2, current_y + y_staff_top + 2, str(idx + 1))
            c.setFillColorRGB(0, 0, 0)

            # === CONTEÚDO DOS PULSOS ===
            beats = measure.get('beats', [])
            beat_width = measure_width / self.beats_per_measure

            for b_idx, beat in enumerate(beats):
                center_x = x_start + b_idx * beat_width + beat_width / 2

                # Linha divisória de pulso (tracejada)
                if b_idx > 0:
                    c.setLineWidth(0.5)
                    c.setDash([2, 2])
                    c.setStrokeColorRGB(0.7, 0.7, 0.7)
                    c.line(x_start + b_idx * beat_width, current_y + y_staff_bottom,
                           x_start + b_idx * beat_width, current_y + y_staff_top)
                    c.setDash([])
                    c.setStrokeColorRGB(0, 0, 0)

                # Harmonia (acorde)
                if beat.get('harmony'):
                    c.setFont("Times-Bold", 14)
                    chord_text = beat['harmony']
                    c.drawCentredString(center_x, current_y + y_chord, chord_text)

                    # Formação vertical do acorde
                    formation = format_chord_vertical(chord_text)
                    if formation:
                        c.setFont("Times-Roman", 9)

                        offset_x = 8
                        for s_idx, note in enumerate(reversed(formation)):
                            note_y = current_y + y_chord + 2 - s_idx * 3.5
                            c.drawString(center_x + offset_x, note_y, note)

                # Melodia
                if beat.get('melody'):
                    c.setFont("Times-Bold", 24)
                    melody_note = self.format_octave_mark(
                        beat['melody'],
                        beat.get('octave', 'normal')
                    )
                    c.drawCentredString(center_x, current_y + y_melody, melody_note)

                # Sílaba
                if beat.get('syllable'):
                    c.setFont("Helvetica", 11)
                    if beat.get('sinalefa'):
                        # Sinalefa em destaque (vermelho escuro)
                        c.setFillColorRGB(0.8, 0.0, 0.0)
                        syl_text = beat['syllable'].replace('~', '‿')
                    else:
                        c.setFillColorRGB(0, 0, 0)
                        syl_text = beat['syllable']

                    c.drawCentredString(center_x, current_y + y_lyrics, syl_text)
                    c.setFillColorRGB(0, 0, 0)

        c.save()
        return output_path


if __name__ == "__main__":
    print("=== Renderizador de Notação Rousseau ===\n")

    # Grade de teste
    test_grid = {
        "measures": [
            {
                "beats": [
                    {"harmony": "I", "syllable": "Eu", "melody": "3", "octave": "normal"},
                    {"harmony": None, "syllable": "gos", "melody": "5", "octave": "normal"},
                    {"harmony": None, "syllable": "ta", "melody": "5", "octave": "up"},
                    {"harmony": None, "syllable": "va~", "melody": "5", "octave": "up", "sinalefa": True},
                ]
            },
            {
                "beats": [
                    {"harmony": "V", "syllable": "tan", "melody": "7", "octave": "normal"},
                    {"harmony": None, "syllable": "to", "melody": "5", "octave": "normal"},
                    {"harmony": None, "syllable": "de", "melody": "3", "octave": "normal"},
                    {"harmony": None, "syllable": "vo", "melody": "2", "octave": "normal"},
                ]
            },
        ]
    }

    renderer = NotationRenderer(time_signature="4/4")

    print("Teste: Gerando SVG...")
    svg_path = "/tmp/teste_rousseau.svg"
    renderer.create_svg(test_grid, svg_path)
    print(f"✅ SVG gerado: {svg_path}\n")

    print("Teste: Gerando PDF...")
    pdf_path = "/tmp/teste_rousseau.pdf"
    renderer.create_pdf(test_grid, pdf_path)
    print(f"✅ PDF gerado: {pdf_path}")
