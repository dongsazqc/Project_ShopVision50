import pika
import json

class RabbitMQConnector:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, host='160.250.5.26', username='agent_user', password='123456'):
        if hasattr(self, '_initialized') and self._initialized:
            return  # Tránh __init__ chạy nhiều lần khi singleton
        credentials = pika.PlainCredentials(username, password)
        params = pika.ConnectionParameters(host, credentials=credentials)
        self.connection = pika.BlockingConnection(params)
        self.channel = self.connection.channel()
        self._initialized = True

    def declare_queue(self, queue_name):
        self.channel.queue_declare(queue=queue_name, durable=True)

    def send_message(self, queue_name, message: dict):
        body = json.dumps(message)
        self.channel.basic_publish(exchange='', routing_key=queue_name, body=body)
        print(f"[✅] Sent to {queue_name}: {body}")

    def consume_messages(self, queue_name, callback):
        def on_message(ch, method, properties, body):
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                print(f"[❌] Message không phải JSON: {body}")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return
            callback(data)
            ch.basic_ack(delivery_tag=method.delivery_tag)

        self.channel.basic_consume(queue=queue_name, on_message_callback=on_message)
        print(f"[🔁] Waiting for messages in '{queue_name}'...")
        self.channel.start_consuming()
