import pymysql.cursors

import config


def connectDB(conf):
    conn = pymysql.connect(
        host=conf.IP,
        user=conf.USER,
        password=conf.PASS,
        database=conf.DB,
        charset='utf8mb4',
    )
    return conn


def get_futon_message() -> list:
    masao_message = [
        ("ここはクソガキの檻", ),
        ("ここにいるインターネットが得意なクソガキ達は、人の悪口を好み、人のプライベートを監視する等、社会に出してはならないクソガキが一定数いる。",),
        ("いち早く更生し、社会適応できる事を期待するが、歪んだ思考のクセはこの檻を利用する以上、治療は困難であろう。",),
        ("何をそんなに他人にムキになれるのだろうか。",),
        ("もしかしたら彼らはゴム人間なのか、毒電波で操られているのか。",),
        ("ともかくこのままでは幸せになる事は不可能であろう。",)
    ]
    with connectDB(config.Config()) as conn:
        with conn.cursor() as cur:
            cur.execute("SHOW TABLES")
            tables = cur.fetchall()

            print("collecting data from SQL")
            for table in tables:
                if table[0] == "user" or table[0].startswith("rank"):
                    continue

                query = "SELECT message FROM {tablename} WHERE userid = 'indegnasen'".format(tablename=table[0])
                cur.execute(query)
                data = cur.fetchall()

                masao_message.extend(data)
    print("obtained all data")
    return masao_message
