import re
import MeCab
import markovify

import db


def parse_text(all_messages: str):
    parsed = ""

    with open("futonchan.txt", "w") as f:
        for message in all_messages:
            f.write(message[0] + "\n")

            for line in message[0].replace("。", "\n").split("\n"):
                if line == "\n":
                    continue
                parsed += MeCab.Tagger("-Owakati /usr/lib/x86_64-linux-gnu/mecab/dic/mecab-ipadic-neologd").parse(line)

    return parsed


def format_text(t: str) -> str:
    t = t.replace('　', ' ')  # Full width spaces
    # t = re.sub(r'([。．！？…]+)', r'\1\n', t)  # \n after ！？
    t = re.sub(r'(.+。) (.+。)', r'\1 \2\n', t)
    t = re.sub(r'\n +', '\n', t)  # Spaces
    return t


messages = db.get_futon_message()
parsed_text = parse_text(messages)

# Build model
text_model = markovify.NewlineText(
    format_text(parsed_text),
    state_size=2,
    well_formed=True
)

# Make Leared file as JSON
with open('./learned.json', 'w') as file:
    file.write(text_model.to_json())
