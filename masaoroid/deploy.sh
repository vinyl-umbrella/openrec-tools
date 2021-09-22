cd `dirname $0`
cp learned.json pub/
cd pub/
gcloud functions deploy masaoroid --trigger-http --runtime python39 --region asia-northeast1
