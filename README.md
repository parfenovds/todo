[![https://imgur.com/Tpjg7TN.png](https://imgur.com/Tpjg7TN.png)](https://imgur.com/Tpjg7TN.png)

TODO-лист в виде дерева

Технологии:
Java, Spring, Spring Boot, Postgresql, Spring Data, Thymeleaf, Maven.
Контроллеры REST, при необходимости возврата html-странички использовались также обычные @Controller.
Фронт базируется на vanilla js, d3.js и [этом графе](https://gist.github.com/robschmuecker/7880033).
Идея навеяна в основном [Zettelkasten](https://en.wikipedia.org/wiki/Zettelkasten).

Для запуска проекта нужно:
1. Клонировать репу.
2. В postgresql создать базу данных todo (или уточнить соответствующим образом src/main/resources/application.yml).
3. Выполнить (например, через psql) src/main/resources/sql/tables.sql и src/main/resources/sql/scripts.sql.
4. Запустить приложение (напр., через intellij idea) и зайти на [localhost](http://localhost:8080).
