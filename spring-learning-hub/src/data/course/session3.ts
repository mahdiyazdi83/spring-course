// Verbatim teacher-source snapshots from 8168a8b47b45a04a71920a144ea65daf09f906a2. Do not silently correct these extracts.

// session3/dependencyInjection/src/ir/digixo/BankClient.java
export const manualClient =
  'package ir.digixo;\n\npublic class BankClient {\n\n   // private MeliImpl meli=new MeliImpl();\n    //private ITransferService service = new MellatImpl();\n\n    // private ITransferService service = Factory.getBank(???);\n\n    @Autowired(id="bank")\n    private ITransferService service;\n    \n    public ITransferService getService() {\n        return service;\n    }\n\n    public void setService(ITransferService service) {\n        this.service = service;\n    }\n    \n    public void transfer(long cardNumber, double amount){\n        System.out.println("Before transfer...");\n        service.transfer(cardNumber, amount);\n        System.out.println("After transfer...");\n    }\n    \n}';

// session3/dependencyInjection/src/ir/digixo/MyContext.java
export const manualContext =
  'package ir.digixo;\n\nimport java.io.FileInputStream;\nimport java.lang.reflect.Field;\nimport java.util.Properties;\n\n\npublic class MyContext {\n    \n    private final String configFile = "src/ir/digixo/my-context.txt";\n\n    public Object getBean(String id) { // factory method\n\n        Object obj = null;\n        Properties p = new Properties();\n        try {\n            p.load( new FileInputStream(configFile) );\n            Class type = Class.forName( p.getProperty(id) );\n           // obj = type.newInstance();\n            obj = type.getConstructor().newInstance();\n        } catch (Exception e) {\n            e.printStackTrace();\n        }    \n        return obj;\n\n    }\n    \n    public void injectIn(Object client) {\n\n        try {\n\n                Class c = client.getClass();\n                for (Field f : c.getDeclaredFields()) {\n                    f.setAccessible(true);\n                    Autowired a = f.getAnnotation(Autowired.class);\n                    if (a != null)\n                        f.set( client, getBean( a.id() ) ); // Injection\n                }\n\n        } catch (Exception e) {\n            e.printStackTrace();\n        }\n\n    }\n    \n}';

// session3/dependencyInjection/src/ir/digixo/Autowired.java
export const manualAnnotation =
  'package ir.digixo;\n\nimport java.lang.annotation.*;\n\n@Target(ElementType.FIELD)\n@Retention(RetentionPolicy.RUNTIME)\npublic @interface Autowired {\n    String id();\n}';

// session3/dependencyInjection/src/ir/digixo/my-context.txt
export const manualConfig = '#id=impl_class\nbank=ir.digixo.MeliImpl';

// session3/dependencyInjection-spring6/src/main/java/ir/digixo/BankClient.java
export const springClient =
  'package ir.digixo;\n\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.beans.factory.annotation.Qualifier;\nimport org.springframework.stereotype.Component;\n\n@Component("bankClient")\npublic class BankClient {\n    \n    @Autowired\n    @Qualifier("bank1")\n    private ITransfer service;\n\n    public ITransfer getService() {\n        return service;\n    }\n\n    public void setService(ITransfer service) {\n        this.service = service;\n    }\n    \n    public void transfer(long cardNumber, double amount){\n        service.transfer(cardNumber, amount);\n    }\n    \n}';

// session3/dependencyInjection-spring6/src/main/java/ir/digixo/Config.java
export const springConfig =
  'package ir.digixo;\n\nimport org.springframework.context.annotation.Bean;\nimport org.springframework.context.annotation.ComponentScan;\nimport org.springframework.context.annotation.Configuration;\n\n@Configuration\n@ComponentScan(basePackages = "ir.digixo")\npublic class Config {\n\n}';

// session3/dependencyInjection-spring6/src/main/java/ir/digixo/Start.java
export const springStart =
  'package ir.digixo;\n\nimport org.springframework.context.ApplicationContext;\nimport org.springframework.context.annotation.AnnotationConfigApplicationContext;\nimport org.springframework.context.support.ClassPathXmlApplicationContext;\n\npublic class Start {\n    \n    public static void main(String[] args) {\n        \n\n\n        ApplicationContext ctx = new AnnotationConfigApplicationContext(Config.class);\n        \n        BankClient ba = (BankClient) ctx.getBean("bankClient");\n        \n        ba.transfer(112333, 100); \n        \n    }\n\n}';

// session3/dependencyInjection-weld17/src/main/java/ir/digixo/bank/BankClient.java
export const weldClient =
  'package ir.digixo.bank;\n\n\nimport jakarta.inject.Inject;\nimport jakarta.inject.Named;\n\npublic class BankClient {\n\n    @Inject\n    @Named("MeliImpl")\n    //@Named("MellatImpl")\n    private ITransfer service;\n\n    public ITransfer getService() {\n        return service;\n    }\n\n    public void setService(ITransfer service) {\n        this.service = service;\n    }\n    \n    public void transfer(long cardNumber, double amount){\n        service.transfer(cardNumber, amount);\n    }\n    \n}';

// session3/dependencyInjection-weld17/src/main/java/ir/digixo/bank/MainHello.java
export const weldStart =
  '\npackage ir.digixo.bank;\n\nimport ir.digixo.weld.HelloService;\nimport org.jboss.weld.environment.se.Weld;\nimport org.jboss.weld.environment.se.WeldContainer;\n\npublic class MainHello {\n    \n    public static void main(String[] args) {\n        \n        Weld weld = new Weld();\n        WeldContainer container = weld.initialize();\n        \n       // BankClient h = container.instance().select(BankClient.class).get();\n        BankClient h = container.select(BankClient.class).get();\n\n        h.transfer(112333,1000);\n        \n        weld.shutdown();\n        \n    }\n\n}';

// session3/dependencyInjection-weld17/src/main/resources/META-INF/beans.xml
export const weldDiscovery =
  '<?xml version="1.0" encoding="UTF-8"?>\n<!--<beans xmlns="http://java.sun.com/xml/ns/javaee"\n       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n       xsi:schemaLocation="\n      http://java.sun.com/xml/ns/javaee\n      http://java.sun.com/xml/ns/javaee/beans_1_0.xsd">\n\n</beans>-->\n<beans xmlns="https://jakarta.ee/xml/ns/jakartaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n       xsi:schemaLocation="\nhttps://jakarta.ee/xml/ns/jakartaee\nhttps://jakarta.ee/xml/ns/jakartaee/beans_3_0.xsd"\n       bean-discovery-mode="all">\n</beans>';

// session3/SpringContextDemo/src/main/resources/config.xml
export const xmlBeans =
  '<?xml version="1.0" encoding="UTF-8"?>\n<beans xmlns="http://www.springframework.org/schema/beans"\n       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n       xsi:schemaLocation="http://www.springframework.org/schema/beans\n       http://www.springframework.org/schema/beans/spring-beans.xsd">\n\n    <!--business obj-->\n\n\n    <bean class="ir.digixo.p02beans.BeanOne"/>\n    <bean class="ir.digixo.p02beans.BeanOne"/>\n    <bean class="ir.digixo.p02beans.BeanTwo" name="two"/>\n\n</beans>';

// session3/SpringContextDemo/src/main/java/ir/digixo/p01container/C02Config.java
export const javaConfig =
  'package ir.digixo.p01container;\n\nimport ir.digixo.p02beans.BeanOne;\nimport org.springframework.context.annotation.Bean;\nimport org.springframework.context.annotation.Configuration;\n\n@Configuration\npublic class C02Config {\n\n\n    @Bean\n    public BeanOne beanOne()\n    {\n        return new BeanOne();\n    }\n}';

// session3/SpringContextDemo/src/main/java/ir/digixo/p04beanDefinition/p01xmlBeanOne/config.xml
export const beanProperties =
  '<?xml version="1.0" encoding="UTF-8"?>\n<beans xmlns="http://www.springframework.org/schema/beans"\n       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n       xmlns:c="http://www.springframework.org/schema/c"\n       xmlns:p="http://www.springframework.org/schema/p"\n       xsi:schemaLocation="http://www.springframework.org/schema/beans\n       http://www.springframework.org/schema/beans/spring-beans.xsd">\n\n    <!--business obj-->\n\n\n    <bean class="ir.digixo.p04beanDefinition.p01xmlBeanOne.BeanOne" name="one" c:name="nahid" p:name="nahid1"  >\n\n       <!-- <constructor-arg value="nahid"/>\n        <property name="name" value="nahid1"/>-->\n    </bean>\n\n\n\n</beans>';

// session3/SpringContextDemo/src/main/java/ir/digixo/p04beanDefinition/p01xmlBeanOne/BeanOne.java
export const beanWithName =
  'package ir.digixo.p04beanDefinition.p01xmlBeanOne;\n\npublic class BeanOne {\n\n    public String name;\n\n    public BeanOne(String name) {\n        System.out.println("constructor with 1 arg called");\n        this.name = name;\n    }\n\n    public String getName() {\n        return name;\n    }\n\n    public void setName(String name) {\n        this.name = name;\n    }\n}';

// session3/BeanFactoryVSApplicationContext/src/main/java/ir/digixo/p01LazyLoadingVSEagerLoading/C01BeanFactoryDemo.java
export const factory =
  'package ir.digixo.p01LazyLoadingVSEagerLoading;\n\nimport ir.digixo.beans.Product;\nimport org.springframework.beans.factory.BeanFactory;\nimport org.springframework.beans.factory.ListableBeanFactory;\nimport org.springframework.beans.factory.support.DefaultListableBeanFactory;\nimport org.springframework.beans.factory.xml.XmlBeanDefinitionReader;\n\nimport org.springframework.core.io.ClassPathResource;\nimport org.springframework.core.io.Resource;\n\npublic class C01BeanFactoryDemo {\n    public static void main( String[] args )\n    {\n\n        var factory = new DefaultListableBeanFactory();\n        XmlBeanDefinitionReader reader=new XmlBeanDefinitionReader(factory);\n        Resource res = new ClassPathResource("p01myContext.xml");\n        reader.loadBeanDefinitions(res);\n        System.out.println(Product.isIsBeanInstantiated());\n\n        //step2\n        Product product1 = factory.getBean("product1", Product.class);\n        System.out.println(Product.isIsBeanInstantiated());\n    }\n}';

// session3/BeanFactoryVSApplicationContext/src/main/java/ir/digixo/p01LazyLoadingVSEagerLoading/C02ApplicationContextDemo.java
export const context =
  'package ir.digixo.p01LazyLoadingVSEagerLoading;\n\nimport ir.digixo.beans.Product;\nimport org.springframework.context.support.ClassPathXmlApplicationContext;\n\npublic class C02ApplicationContextDemo {\n    public static void main( String[] args )\n    {\n        var context = new ClassPathXmlApplicationContext("p01myContext.xml");\n        System.out.println(Product.isIsBeanInstantiated());\n\n\n    }\n}';

// session3/BeanFactoryVSApplicationContext/src/main/resources/p02myContext.xml
export const processors =
  '<?xml version="1.0" encoding="UTF-8"?>\n<beans xmlns="http://www.springframework.org/schema/beans"\n       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n       xsi:schemaLocation="\n       http://www.springframework.org/schema/beans\n       http://www.springframework.org/schema/beans/spring-beans.xsd">\n\n\n    <bean id="myBeanPostProcessor"\n          class="ir.digixo.p02AutomaticRegistrationOFBeanFactoryPostProcessorAndBeanPostProcessor.C02MyBeanPostProcessor" />\n    <bean id="myBeanFactoryPostProcessor"\n          class="ir.digixo.p02AutomaticRegistrationOFBeanFactoryPostProcessorAndBeanPostProcessor.C01MyBeanFactoryPostProcessor" />\n\n</beans>';
