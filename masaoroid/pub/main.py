import markovify


def masaoroid(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    headers = {
        'Access-Control-Allow-Origin': '*'
    }
    print("[masaoroid]")

    try:
        with open('./learned.json', 'r') as file:
            text_model = markovify.NewlineText.from_json(file.read())
        sentence = None
        while sentence is None:
            sentence = text_model.make_short_sentence(max_chars=100, min_chars=10)
        message = sentence.replace(" ", "")
        return (message, 200, headers)
    except:
        return ("error", 500, headers)


if __name__ == "__main__":
    print(masaoroid("")[0])
