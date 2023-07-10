# import sourcedefender
from bma_utils import create_app

app = create_app()
app.run(debug=True, host='localhost', port='5002', threaded=True)
