# Technical terminology in Persian lessons

Write natural Persian explanations while retaining the English names developers use
in code, documentation, interviews and everyday work. This is a balance, not an
instruction to translate every word into English.

## Preferred terms

| Use in teaching prose                                      | Avoid as the primary technical name           |
| ---------------------------------------------------------- | --------------------------------------------- |
| abstract class / abstract method                           | کلاس انتزاعی / متد انتزاعی                    |
| interface / functional interface                           | رابط / رابط تابعی                             |
| anonymous class                                            | کلاس بی‌نام                                   |
| constructor                                                | سازنده                                        |
| constructor injection / setter injection / field injection | تزریق سازنده / تزریق تنظیم‌کننده / تزریق فیلد |
| Dependency Injection (DI)                                  | تزریق وابستگی                                 |
| circular dependency                                        | وابستگی دوری / وابستگی چرخه‌ای                |
| Stream pipeline                                            | خط لولهٔ Stream                               |
| method reference                                           | ارجاع متد                                     |

Keep names such as Bean, ApplicationContext, Factory, Repository, Autowiring,
Qualifier, Primary, Lambda, Stream, Optional, Reflection, scope and lifecycle
recognizable. Match exact spelling and case for Java identifiers and APIs.

## Keep the explanation readable

- Introduce an unfamiliar term with a short Persian explanation at its first useful
  occurrence. For example: «abstract class کلاسی است که نمی‌توان مستقیماً از آن
  نمونه ساخت؛ زیرکلاس می‌تواند رفتارهای abstract آن را پیاده کند.»
- Use the same English term consistently in titles, navigation, summaries, tables,
  exercises and prose. Do not repeat a translation in parentheses every time.
  Use DI after introducing Dependency Injection when it reads better.
- Keep familiar Persian wording such as شیء، وابستگی، پیاده‌سازی، ورودی، خروجی،
  مقدار، ارث‌بری and فراخوانی. Common loanwords such as کلاس، متد، فیلد، کانتینر
  and کامپایلر are fine. Avoid replacing ordinary grammar with English jargon.
- Prefer «داشتن فقط یک constructor» to awkward hybrids such as «تک‌constructor».
  Persian explanations are welcome; concept names should remain searchable in English.
- Judge meaning before replacing a word: رابط کاربری is UI prose, سازنده may refer
  to a person, and مخزن may mean a Git repository. Never replace blindly.
- Preserve quoted source wording, executable examples, code strings/comments,
  identifiers, paths, URLs, stable anchors, provenance and historical changelog entries.
  Editorial summaries may be reworded without changing what the source claims.
- Review terminology during each session/concept update. This does not authorize
  reprocessing every recording. Keep all substantive educational content.
