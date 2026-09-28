// Verified verbatim excerpts; do not edit teacher code to apply corrections.
// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/functional/src/p01lambdaExpression/C01CheckProgrammer.java · lines 1-11
export const sam =
  'package p01lambdaExpression;\n\n\n//todo: sam=> single abstract method\n@FunctionalInterface\npublic interface C01CheckProgrammer {\n     boolean test(C02Programmer programmer);//todo: i dont know\n\n    default void m1(){}\n    default void m2(){}\n}';

// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/functional/src/p01lambdaExpression/C06Test3.java · lines 17-19
export const lambda =
  '        show(programmers,(C02Programmer programmer)-> {\n                return programmer.canDoc();\n        });';

// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/functional/src/p02basic/C02Test.java · lines 22-41
export const references =
  '        C04SupperHuman supperHuman=new C04SupperHuman();\n        C01Human human4=supperHuman::harfzadan;    //i dont know\n        human4.speak();\n\n\n        /////\n\n        // String speak(String text);\n\n        C03NewHuman human5=C04SupperHuman::speak3;\n        human5.speak("DDDD");\n\n        ////\n\n\n\n        C03NewHuman human6=String::toUpperCase;\n        human6.speak("dddddd");\n\n        C01Human human7=C04SupperHuman::new;';

// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/functional/src/p04stream/p01optional/OptionalDemo.java · lines 14-25
export const optional =
  '    public static Optional<Double> avg(int... numbers)\n    {\n        if (numbers.length==0)\n            return Optional.empty();\n        else {\n            //sum\n            IntStream.of(numbers).sum();\n            //avg\n            double asDouble = IntStream.of(numbers).average().getAsDouble();\n            return Optional.of(asDouble);\n        }\n    }';

// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/functional/src/p04stream/p02source/SourceOfData.java · lines 10-27
export const sources =
  '        Stream<String> s1 = Stream.empty();\n        Stream<Integer> integerStream = Stream.of(1, 2);\n\n        List<String> list1 = List.of("a", "d", "f");\n        Stream<String> stream = list1.stream();\n        Stream<String> stringStream = list1.parallelStream();\n\n      //  stream.forEach(System.out::println);\n\n\n\n        //todo: infinite Stream\n\n        Stream<Double> generate = Stream.generate(() -> Math.random());\n       // generate.forEach(System.out::println);\n\n        Stream<Integer> iterate = Stream.iterate(1,integer -> integer<100, integer -> integer + 2);\n        iterate.forEach(System.out::println);';

// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/functional/src/p04stream/p03TerminalOperations/TerminalOperationDemo.java · lines 1-30
export const terminal =
  'package p04stream.p03TerminalOperations;\n\nimport java.util.Optional;\nimport java.util.TreeSet;\nimport java.util.stream.Collectors;\nimport java.util.stream.Stream;\n\npublic class TerminalOperationDemo {\n    public static void main(String[] args) {\n        Stream<String> cars = Stream.of("BMV", "TOYOTA", "BENZ");\n\n        //cars.forEach(System.out::println);\n       // Optional<String> min = cars.min((o1, o2) -> o1.length() - o2.length());\n      //  min.ifPresent(System.out::println);\n\n      //  long count = cars.count();\n\n      //  cars.findFirst().ifPresent(System.out::println);\n\n       //\n        String reduce = cars.reduce("", String::concat);\n        System.out.println(reduce);\n\n      //  cars.map()\n\n        //\n\n        cars.collect(Collectors.toCollection(() -> new TreeSet<>()));\n    }\n}';

// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/functional/src/p04stream/p04intermediateOperations/Demo.java · lines 1-22
export const intermediate =
  'package p04stream.p04intermediateOperations;\n\nimport java.util.stream.Stream;\n\npublic class Demo {\n    public static void main(String[] args) {\n        Stream<String> cars = Stream.of("BMW", "TOYOTA", "BENZ","BMW");\n\n        /*Stream<String> stringStream = cars.filter(s -> s.startsWith("B"));\n        Stream<String> distinct = stringStream.distinct();\n        distinct.forEach(System.out::println);*/\n\n       /* Stream<String> limit = cars.skip(1).limit(2);\n        limit.forEach(System.out::println);*/\n\n       // cars.map(String::length).forEach(System.out::println);\n\n        cars.peek(System.out::println).forEach(System.out::println);\n\n\n    }\n}';

// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/functional/src/p04stream/p05cars/Test.java · lines 35-40
export const cars =
  '        Optional<Integer> bmw = list.stream()\n                .filter(car -> car.name.equals("bmw"))\n                .map(car -> car.price)\n                .reduce((integer, integer2) -> integer + integer);\n\n        bmw.ifPresent(System.out::println);';

// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/functional/src/p04stream/Test.java · lines 1-19
export const infinite =
  'package p04stream;\n\nimport java.util.stream.IntStream;\nimport java.util.stream.Stream;\n\npublic class Test {\n    public static void main(String[] args) {\n        Stream\n                .generate(() -> "Rana")\n                .filter(s -> s.length()==4)\n\n                .limit(2)\n                .sorted()\n                .forEach(System.out::println);\n\n\n\n    }\n}';

// 8168a8b47b45a04a71920a144ea65daf09f906a2 · session2/maven_demo/pom.xml · lines 1-30
export const pom =
  '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">\n  <modelVersion>4.0.0</modelVersion>\n\n  <groupId>ir.digixo</groupId>\n  <artifactId>maven_demo</artifactId>\n  <version>1.0-SNAPSHOT</version>\n\n  <packaging>jar</packaging>\n\n  <name>maven_demo</name>\n  <url>http://maven.apache.org</url>\n\n  <properties>\n    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\n  </properties>\n\n  <dependencies>\n    <!-- Source: https://mvnrepository.com/artifact/com.mysql/mysql-connector-j -->\n    <dependency>\n      <groupId>org.springframework</groupId>\n      <artifactId>spring-core</artifactId>\n      <version>7.0.8</version>\n    </dependency>\n  </dependencies>\n\n  <build>\n    <finalName>test</finalName>\n  </build>\n</project>';
