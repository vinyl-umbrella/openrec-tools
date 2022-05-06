import markovify


with open('./learned.json', 'r') as file:
    TEXT_MODEL = markovify.NewlineText.from_json(file.read())


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

    try:
        sentence = None
        while sentence is None:
            sentence = TEXT_MODEL.make_short_sentence(max_chars=100, min_chars=10)
        message = sentence.replace(" ", "")
        return (message, 200, headers)
    except:
        return ("error", 500, headers)
