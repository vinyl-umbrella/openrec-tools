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
    masao_message = []
    with connectDB(config.Config()) as conn:
        with conn.cursor() as cur:
            cur.execute("SHOW TABLES")
            tables = cur.fetchall()

            print("collecting data from SQL")
            for table in tables:
                if table[0] == "user":
                    continue

                query = "SELECT message FROM {tablename} WHERE userid = 'indegnasen'".format(tablename=table[0])
                cur.execute(query)
                data = cur.fetchall()

                masao_message.extend(data)
    print("obtained all data")
    return masao_message
