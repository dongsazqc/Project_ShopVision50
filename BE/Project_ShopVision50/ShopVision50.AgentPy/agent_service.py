from rabbit_connector import RabbitMQConnector

def handle_message(message):
    print(f"[📥] Nhận message: {message}")

    question = message.get("question") or message.get("Question") or ""
    question = question.lower()
    
    user = message.get("user") or message.get("User") or "unknown"

    if "giá" in question:
        response = "Giá sản phẩm hiện tại là 500k nha bro!"
    elif "ship" in question:
        response = "Bên mình ship toàn quốc, nhận hàng trong 2-3 ngày!"
    else:
        response = "Tao chưa hiểu ý m, nói rõ hơn được không?"

    rabbit.send_message("response_queue", {"user": user, "answer": response})
    print(f"[📤] Gửi phản hồi: {response}")


if __name__ == "__main__":
    rabbit = RabbitMQConnector(host="160.250.5.26", username="agent_user", password="123456")
    rabbit.declare_queue("question_queue")
    rabbit.declare_queue("response_queue")

    rabbit.consume_messages("question_queue", handle_message)
