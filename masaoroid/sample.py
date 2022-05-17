import markovify

with open('./learned.json', 'r') as file:
    text_model = markovify.NewlineText.from_json(file.read())


while True:
    for i in range(10):
        sentence = None
        while sentence is None:
            sentence = text_model.make_short_sentence(max_chars=90, min_chars=10)

        print(sentence.replace(" ", ""))
    input()
