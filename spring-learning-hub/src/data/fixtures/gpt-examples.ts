// Demonstration snippets only. These are not a complete application.
export const java = `import java.util.ArrayList;
import java.util.List;

interface Sender {
    void send(String message);
}

final class RecordingSender implements Sender {
    private final List<String> messages = new ArrayList<>();

    @Override
    public void send(String message) {
        messages.add(message);
    }

    List<String> messages() {
        return List.copyOf(messages);
    }
}

final class Notifier {
    private final Sender sender;

    Notifier(Sender sender) {
        this.sender = sender;
    }

    void notifyUser(String message) {
        sender.send(message);
    }
}

public class Demo {
    public static void main(String[] args) {
        RecordingSender sender = new RecordingSender();
        Notifier notifier = new Notifier(sender);
        notifier.notifyUser("This intentionally long message checks horizontal code scrolling without changing the Persian page width.");
        System.out.println(sender.messages());
    }
}`;
export const xml = `<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.springframework.org/schema/beans https://www.springframework.org/schema/beans/spring-beans.xsd">
    <bean id="sender" class="example.ConsoleSender" />
    <bean id="notifier" class="example.Notifier">
        <constructor-arg ref="sender" />
    </bean>
</beans>`;
export const yaml = `spring:
  application:
    name: learning-example`;
export const properties = `spring.application.name=learning-example
logging.level.example=DEBUG`;
export const sql = `SELECT id, message
FROM notifications
ORDER BY id DESC;`;
export const bash = `javac Demo.java
java Demo`;
export const json = `{
  "message": "Learning example",
  "delivered": false
}`;
