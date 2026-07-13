"""
Processador de Sílabas - Sistema Rousseau

Módulo para separação silábica em português e detecção de sinalefas
(fusão de vogais entre palavras adjacentes).
"""

import re
import pyphen


class SyllableProcessor:
    """Processa letras de músicas separando sílabas e detectando sinalefas."""

    def __init__(self, language="pt_BR"):
        """
        Inicializa o processador de sílabas.

        Args:
            language: código do idioma (padrão: pt_BR)
        """
        try:
            self.dic = pyphen.Pyphen(lang=language)
        except:
            # Fallback para português europeu
            try:
                self.dic = pyphen.Pyphen(lang="pt_PT")
            except:
                # Sem dicionário disponível, usa separação manual
                self.dic = None

    def _is_vowel(self, char):
        """Verifica se um caractere é vogal (incluindo acentuadas)."""
        vowels = "aeiouáéíóúâêôãõàèìòù"
        return char.lower() in vowels

    def _manual_syllable_split(self, word):
        """
        Versão aprimorada para separação silábica em Português.
        Segue regras fonéticas para V-CV, VC-CV e grupos consonantais.
        """
        if not word:
            return []
        word = word.lower()

        syllables = []
        last_split = 0
        i = 0

        while i < len(word):
            if self._is_vowel(word[i]):
                nucleus_end = i
                while nucleus_end + 1 < len(word) and self._is_vowel(word[nucleus_end + 1]):
                    nucleus_end += 1

                next_vowel_pos = -1
                for j in range(nucleus_end + 1, len(word)):
                    if self._is_vowel(word[j]):
                        next_vowel_pos = j
                        break

                if next_vowel_pos == -1:
                    syllables.append(word[last_split:])
                    last_split = len(word)
                    break

                consonants = word[nucleus_end + 1:next_vowel_pos]
                split_point = next_vowel_pos

                if not consonants:
                    split_point = next_vowel_pos
                elif len(consonants) == 1:
                    split_point = nucleus_end + 1
                elif len(consonants) == 2:
                    cc = consonants
                    inseparable = ["br", "cr", "dr", "fr", "gr", "pr", "tr", "vr",
                                   "bl", "cl", "fl", "gl", "pl", "ch", "lh", "nh",
                                   "qu", "gu"]
                    if cc in inseparable:
                        split_point = nucleus_end + 1
                    else:
                        split_point = nucleus_end + 2
                else:
                    split_point = nucleus_end + 2

                syllables.append(word[last_split:split_point])
                last_split = split_point
                i = split_point - 1
            i += 1

        if last_split < len(word):
            if syllables:
                syllables[-1] += word[last_split:]
            else:
                syllables.append(word[last_split:])

        return [s for s in syllables if s]

    def split_word(self, word):
        """
        Separa uma palavra em sílabas.

        Args:
            word: str - palavra a ser separada

        Returns:
            list de strings (sílabas)
        """
        clean_word = re.sub(r'[^\w\s]', '', word)

        if not clean_word:
            return []

        if self.dic:
            separated = self.dic.inserted(clean_word, hyphen='-')
            return separated.split('-')

        return self._manual_syllable_split(clean_word)

    def detect_sinalefa(self, word1, word2):
        """
        Detecta se há sinalefa entre duas palavras.

        Uma sinalefa ocorre quando a última vogal de uma palavra
        se encontra com a primeira vogal da próxima.

        Args:
            word1, word2: strings

        Returns:
            bool: True se houver sinalefa
        """
        if not word1 or not word2:
            return False

        w1_clean = re.sub(r'[^\w]', '', word1)
        w2_clean = re.sub(r'[^\w]', '', word2)

        if not w1_clean or not w2_clean:
            return False

        last_char = w1_clean[-1].lower()
        first_char = w2_clean[0].lower()

        return self._is_vowel(last_char) and self._is_vowel(first_char)

    def process_lyrics(self, lyrics_text):
        """
        Processa uma letra completa, separando sílabas e fundindo sinalefas.
        Garante que sinalefas ocupem o mesmo pulso rítmico (uma linha na grid).
        """
        lyrics = lyrics_text.strip()
        words = lyrics.split()
        if not words:
            return []

        all_words_syllables = [self.split_word(w) for w in words]

        flat_syllables = []
        for i in range(len(words)):
            for j in range(len(all_words_syllables[i])):
                flat_syllables.append({
                    'text': all_words_syllables[i][j],
                    'word_idx': i,
                    'syl_idx': j,
                    'is_last_in_word': j == len(all_words_syllables[i]) - 1
                })

        result = []
        i = 0
        while i < len(flat_syllables):
            current = flat_syllables[i]
            text = current['text']
            merged = False

            temp_idx = i
            while flat_syllables[temp_idx]['is_last_in_word'] and temp_idx + 1 < len(flat_syllables):
                next_syl = flat_syllables[temp_idx + 1]
                word1 = words[flat_syllables[temp_idx]['word_idx']]
                word2 = words[next_syl['word_idx']]

                if self.detect_sinalefa(word1, word2):
                    text += '~' + next_syl['text']
                    merged = True
                    temp_idx += 1
                    if not next_syl['is_last_in_word']:
                        break
                else:
                    break

            result.append({
                'text': text,
                'type': 'syllable',
                'sinalefa': merged
            })

            i = temp_idx + 1

        return result

    def get_syllable_count(self, lyrics_text):
        """
        Retorna o número total de sílabas (considerando sinalefas).

        Args:
            lyrics_text: str

        Returns:
            int: contagem de sílabas
        """
        processed = self.process_lyrics(lyrics_text)
        return len(processed)

    def format_for_display(self, processed_syllables):
        """
        Formata sílabas processadas para exibição.

        Args:
            processed_syllables: lista retornada por process_lyrics()

        Returns:
            str: texto formatado
        """
        return ' - '.join([syl['text'] for syl in processed_syllables])


if __name__ == "__main__":
    processor = SyllableProcessor()

    print("=== Processador de Sílabas ===\n")

    print("Teste 1: Palavra 'música'")
    syllables = processor.split_word("música")
    print(f"  Resultado: {'-'.join(syllables)}\n")

    print("Teste 2: Sinalefa 'terra e'")
    has_sinalefa = processor.detect_sinalefa("terra", "e")
    print(f"  Tem sinalefa? {has_sinalefa}\n")

    print("Teste 3: Letra completa")
    lyrics = "Eu gostava tanto de você"
    processed = processor.process_lyrics(lyrics)

    print(f"  Texto original: {lyrics}")
    print(f"  Total de sílabas: {len(processed)}")
    print("  Separação:")
    for i, syl in enumerate(processed, 1):
        marker = " [SINALEFA]" if syl['sinalefa'] else ""
        print(f"    {i}. {syl['text']}{marker}")

    print(f"\n  Formatado: {processor.format_for_display(processed)}")
