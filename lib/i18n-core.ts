/**
 * Translation core. Kept free of React so the audit engine can use it too.
 * Russian is the primary interface language; English is the alternative.
 */

import { extraEn, extraRu } from "@/lib/i18n-extra";

export type Locale = "ru" | "en";

export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALES: Locale[] = ["ru", "en"];

export function isLocale(value: unknown): value is Locale {
  return value === "ru" || value === "en";
}

export function intlLocale(locale: Locale): string {
  return locale === "ru" ? "ru-RU" : "en-US";
}

type Dict = Record<string, string>;

const en: Dict = {
  "nav.overview": "Overview",
  "nav.audit": "Security Audit",
  "nav.auditShort": "Audit",
  "nav.privacy": "Privacy",
  "nav.reports": "Reports",
  "nav.primary": "Primary",
  "brand.overview": "Digital Footprint, overview",

  "theme.toLight": "Switch to light theme",
  "theme.toDark": "Switch to dark theme",
  "lang.switch": "Switch language",
  "lang.switchToEn": "Switch to English",
  "lang.switchToRu": "Switch to Russian",

  "header.notifications": "Notifications, {count} open",
  "header.recommendations": "Open recommendations",
  "header.nothing": "Nothing needs attention right now.",
  "header.reading": "Reading your browser…",
  "header.tapToReview": "{severity} · tap to review",
  "header.profile": "Profile menu",
  "header.thisDevice": "This device",
  "header.storedOnly": "Audits are stored in this browser only",
  "header.download": "Download report",
  "header.clearHistory": "Clear audit history",
  "header.clearTitle": "Clear audit history?",
  "header.clearDesc":
    "This removes {count} saved audits from this browser. Your checklist answers stay.",
  "header.keepHistory": "Keep history",
  "header.clearConfirm": "Clear history",

  "toast.reportTitle": "Report downloaded",
  "toast.reportDesc": "A JSON file was saved to your downloads.",
  "toast.historyCleared": "History cleared",
  "toast.historyClearedDesc": "Saved audits were removed from this device.",
  "toast.auditSaved": "Audit saved",
  "toast.auditSavedDesc": "Score {score} of 100. It was added to your history.",

  "hero.title1": "Your Digital Life.",
  "hero.title2": "Under Control.",
  "hero.subtitle":
    "Understand your digital footprint, identify privacy risks and protect your online identity.",
  "hero.start": "Start Security Audit",
  "hero.privacy": "Runs in your browser. Nothing leaves this device.",

  "action.scanning": "Scanning…",
  "action.runSave": "Run and save audit",

  "score.title": "Security score",
  "score.desc": "Built only from checks we could verify",
  "score.checksAnswered": "Checks answered",
  "score.completeHint": "Answer the account checklist to complete the score.",
  "score.noCompare": "No saved audit to compare with yet.",
  "score.noChange": "No change",
  "score.since": "since {date} audit",
  "score.aria": "Security score {score} out of 100",
  "score.outOf": "out of 100",

  "scoreLabel.Strong": "Strong",
  "scoreLabel.Good": "Good",
  "scoreLabel.Needs attention": "Needs attention",
  "scoreLabel.At risk": "At risk",

  "severity.critical": "Critical",
  "severity.high": "High",
  "severity.medium": "Medium",
  "severity.low": "Low",

  "issue.one": "issue",
  "issue.few": "issues",
  "issue.many": "issues",
  "points.one": "point",
  "points.few": "points",
  "points.many": "points",
  "cores.one": "core",
  "cores.few": "cores",
  "cores.many": "cores",

  "threat.title": "Threat analysis",
  "threat.desc": "Confirmed issues by severity",
  "threat.noIssues": "No issues",
  "threat.allClear": "No confirmed issues. Unanswered checklist items are not counted.",
  "threat.note":
    "Counts include only what your browser reported or you answered. Nothing is estimated.",

  "privacy.title": "Privacy monitor",
  "privacy.desc": "What this browser exposes",
  "privacy.browser": "Browser",
  "privacy.webrtc": "WebRTC",
  "privacy.cookies": "Cookies",
  "privacy.storage": "Local storage",
  "privacy.signal": "Privacy signal",
  "privacy.available": "Available",
  "privacy.unavailable": "Not available",
  "privacy.enabled": "Enabled",
  "privacy.disabled": "Disabled",
  "privacy.storageAvailable": "Available",
  "privacy.blocked": "Blocked",
  "privacy.sent": "Sent",
  "privacy.notSent": "Not sent",
  "privacy.recs": "Recommendations",
  "privacy.nothing": "Nothing to fix based on what a web page can check.",
  "privacy.details": "Open privacy details",

  "network.title": "Network identity",
  "network.desc": "What sites can see about your connection",
  "network.publicIp": "Public IP",
  "network.ipHint": "Not visible on a local address. Deploy over the internet to see it.",
  "network.showIp": "Show IP address",
  "network.hideIp": "Hide IP address",
  "network.notAvailable": "Not available",
  "network.connection": "Connection",
  "network.connHint": "This browser does not report connection details.",
  "network.unknown": "Unknown",
  "network.dns": "DNS",
  "network.dnsHint": "Web pages cannot see which resolver you use.",
  "network.notExposed": "Not exposed to pages",
  "network.https": "HTTPS",
  "network.encrypted": "Encrypted",
  "network.localOnly": "Local only",
  "network.notEncrypted": "Not encrypted",
  "network.region": "Approximate region",
  "network.regionFromIp": "From your IP address",
  "network.regionFromTz": "Inferred from your time zone, not your location",

  "device.title": "Device audit",
  "device.desc": "Details every site you visit can read",
  "device.browser": "Browser",
  "device.os": "Operating system",
  "device.screen": "Screen",
  "device.language": "Language",
  "device.timezone": "Time zone",
  "device.hardware": "Hardware",
  "device.coresHidden": "Cores hidden",
  "device.touch": "touch",
  "device.note":
    "Taken together, these details can make a browser recognizable without cookies.",

  "footprint.title": "Digital footprint",
  "footprint.desc": "{answered} of {total} checklist items answered",
  "footprint.done": "Done",
  "footprint.toFix": "{count} to fix",
  "footprint.of": "{yes} of {total}",
  "footprint.notAnswered": "Not answered",
  "footprint.recs": "Personal recommendations",
  "footprint.empty": "Answer the checklist and your next steps appear here.",
  "footprint.noGaps": "No gaps in the items you answered.",
  "footprint.start": "Start the checklist",
  "footprint.open": "Open checklist",

  "history.title": "Audit history",
  "history.desc": "{count} saved audits on this device",
  "history.savedOnly": "Saved on this device only",
  "history.all": "All reports",
  "history.empty": "Run your first audit to start tracking how your score changes.",
  "history.blocked":
    "This browser blocks local storage, so audits cannot be saved. Allow storage for this site to keep a history.",
  "history.runFirst": "Run first audit",
  "history.scoreName": "Score",

  "group.two-factor": "Two-factor authentication",
  "group.passwords": "Password hygiene",
  "group.accounts": "Account security",

  "checklist.yes": "Yes",
  "checklist.no": "No",

  "audit.title": "Security audit",
  "audit.desc":
    "Browser checks run automatically. Account checks come from your answers, because a web page cannot see inside your accounts.",
  "audit.checklistTitle": "Account checklist",
  "audit.checklistDesc": "Answers stay on this device",
  "audit.allChecks": "All checks",
  "audit.checksCount": "{count} checks in this audit",
  "audit.nextSteps": "Next steps",
  "audit.status.pass": "Passed",
  "audit.status.warn": "Review",
  "audit.status.fail": "Failed",
  "audit.status.info": "Info",
  "audit.status.unknown": "Not answered",

  "privacyPage.title": "Privacy",
  "privacyPage.desc":
    "What this browser, device and connection reveal to the sites you visit. Everything here is read directly from your browser.",
  "privacyPage.detail": "Browser checks in detail",
  "privacyPage.good": "Good",
  "privacyPage.review": "Review",
  "privacyPage.fix": "Fix",
  "privacyPage.info": "Info",

  "reports.title": "Reports",
  "reports.desc":
    "Every audit you save is kept in this browser. Download a report to keep it or share it. It never includes your IP address.",
  "reports.download": "Download report",

  "dialog.running": "Running security audit",
  "dialog.runningDesc": "Checks run in your browser. Nothing is uploaded.",
  "dialog.step1": "Reading browser and device details",
  "dialog.step2": "Checking privacy settings",
  "dialog.step3": "Checking the connection",
  "dialog.step4": "Calculating your score",
  "dialog.complete": "Audit complete",
  "dialog.saved": "Saved to your history · {count} audits on this device",
  "dialog.first": "This is your first saved audit.",
  "dialog.same": "Same score as your last audit.",
  "dialog.up": "Up {count} {points} from your last audit.",
  "dialog.down": "Down {count} {points} from your last audit.",
  "dialog.coverage":
    "{pct}% of checks answered. Finish the checklist for a complete score.",
  "dialog.fixFirst": "Fix first",
  "dialog.finish": "Finish checklist",
  "dialog.done": "Done",

  "common.reading": "Reading your browser",
  "common.dismiss": "Dismiss notification",
  "common.close": "Close",

  "check.unanswered": "Not answered yet.",

  "check.https.label": "Encrypted connection",
  "check.https.detailLocal": "Local development address. Traffic does not leave this computer.",
  "check.https.detailSecure": "This page is served over HTTPS.",
  "check.https.detailInsecure":
    "This page is served over plain HTTP, so anyone on the network can read or change it.",
  "check.https.rec": "Open this app over HTTPS before you enter any personal data.",

  "check.webrtc.label": "WebRTC",
  "check.webrtc.detailAvailable":
    "Available. Sites can use it to learn local network addresses. We checked availability only and did not test for a leak.",
  "check.webrtc.detailUnavailable": "Not available in this browser.",
  "check.webrtc.rec":
    "If you use a VPN, run a WebRTC leak test and consider a browser setting or extension that limits WebRTC.",

  "check.gpc.label": "Global Privacy Control (GPC)",
  "check.gpc.detailOn": "Your browser tells sites not to sell or share your data.",
  "check.gpc.detailOff":
    "Your browser does not send the signal asking sites not to sell or share your data.",
  "check.gpc.rec":
    "Turn on Global Privacy Control, or use a browser or extension that sends it.",

  "check.cookies.label": "Cookies",
  "check.cookies.detailOn":
    "Enabled. A page cannot read your third-party cookie policy, so check it in browser settings.",
  "check.cookies.detailOff": "Disabled for this site. Some features may not work.",

  "check.storage.label": "Local storage",
  "check.storage.detailOn":
    "Available. Sites you visit can keep data on this device until you clear it.",
  "check.storage.detailOff": "Blocked. Your audit history cannot be saved on this device.",

  "check.dnt.label": "Do Not Track",
  "check.dnt.detailOn": "On. Most sites ignore it, so it protects little by itself.",
  "check.dnt.detailOff": "Off or not reported. Most sites ignore this setting anyway.",

  "checklistItem.2fa-email.label": "Two-factor sign-in on my main email",
  "checklistItem.2fa-email.hint": "Your email can reset every other account.",
  "checklistItem.2fa-email.rec":
    "Turn on two-factor sign-in for your main email first. Prefer an authenticator app or a security key over SMS.",
  "checklistItem.2fa-other.label": "Two-factor sign-in on banking and social accounts",
  "checklistItem.2fa-other.hint": "Covers accounts that hold money or your identity.",
  "checklistItem.2fa-other.rec":
    "Enable two-factor sign-in on banking, social and cloud storage accounts, starting with the one you would miss most.",
  "checklistItem.unique-passwords.label": "Every important account has its own password",
  "checklistItem.unique-passwords.hint": "One leaked password should not open a second account.",
  "checklistItem.unique-passwords.rec":
    "Replace reused passwords, starting with email, banking and any account that stores payment details.",
  "checklistItem.password-manager.label": "I use a password manager",
  "checklistItem.password-manager.hint": "Makes long, unique passwords practical.",
  "checklistItem.password-manager.rec":
    "Set up a password manager and move your most important accounts into it first.",
  "checklistItem.recovery-current.label": "Recovery email and phone are up to date",
  "checklistItem.recovery-current.hint": "Lets you get back in, and keeps others out.",
  "checklistItem.recovery-current.rec":
    "Check the recovery email and phone number on your main accounts and remove ones you no longer own.",
  "checklistItem.app-permissions.label": "I reviewed apps connected to my accounts this year",
  "checklistItem.app-permissions.hint":
    "Old “Sign in with…” connections keep their access.",
  "checklistItem.app-permissions.rec":
    "Open the connected-apps page of your Google, Apple and social accounts and remove anything you no longer use.",
  "checklistItem.auto-updates.label": "Browser and OS updates install automatically",
  "checklistItem.auto-updates.hint": "Most attacks use bugs that already have a fix.",
  "checklistItem.auto-updates.rec":
    "Turn on automatic updates for your browser and operating system.",
};

const ru: Dict = {
  "nav.overview": "Обзор",
  "nav.audit": "Аудит безопасности",
  "nav.auditShort": "Аудит",
  "nav.privacy": "Приватность",
  "nav.reports": "Отчёты",
  "nav.primary": "Основная навигация",
  "brand.overview": "Digital Footprint, обзор",

  "theme.toLight": "Включить светлую тему",
  "theme.toDark": "Включить тёмную тему",
  "lang.switch": "Сменить язык",
  "lang.switchToEn": "Switch to English",
  "lang.switchToRu": "Переключить на русский",

  "header.notifications": "Уведомления, открыто: {count}",
  "header.recommendations": "Открытые рекомендации",
  "header.nothing": "Сейчас ничего не требует внимания.",
  "header.reading": "Читаем ваш браузер…",
  "header.tapToReview": "{severity} · нажмите, чтобы проверить",
  "header.profile": "Меню профиля",
  "header.thisDevice": "Это устройство",
  "header.storedOnly": "Аудиты хранятся только в этом браузере",
  "header.download": "Скачать отчёт",
  "header.clearHistory": "Очистить историю аудитов",
  "header.clearTitle": "Очистить историю аудитов?",
  "header.clearDesc":
    "Будет удалено сохранённых аудитов: {count}. Ответы в чек-листе останутся.",
  "header.keepHistory": "Оставить историю",
  "header.clearConfirm": "Очистить историю",

  "toast.reportTitle": "Отчёт скачан",
  "toast.reportDesc": "JSON-файл сохранён в загрузки.",
  "toast.historyCleared": "История очищена",
  "toast.historyClearedDesc": "Сохранённые аудиты удалены с этого устройства.",
  "toast.auditSaved": "Аудит сохранён",
  "toast.auditSavedDesc": "Оценка {score} из 100. Добавлено в историю.",

  "hero.title1": "Ваша цифровая жизнь.",
  "hero.title2": "Под контролем.",
  "hero.subtitle":
    "Понимайте свой цифровой след, находите риски приватности и защищайте свою онлайн-личность.",
  "hero.start": "Начать аудит безопасности",
  "hero.privacy": "Работает в браузере. Ничего не покидает устройство.",

  "action.scanning": "Сканирование…",
  "action.runSave": "Запустить и сохранить аудит",

  "score.title": "Оценка безопасности",
  "score.desc": "Строится только на проверяемых пунктах",
  "score.checksAnswered": "Пройдено проверок",
  "score.completeHint": "Ответьте на чек-лист аккаунтов, чтобы завершить оценку.",
  "score.noCompare": "Пока нет сохранённого аудита для сравнения.",
  "score.noChange": "Без изменений",
  "score.since": "с аудита {date}",
  "score.aria": "Оценка безопасности {score} из 100",
  "score.outOf": "из 100",

  "scoreLabel.Strong": "Надёжно",
  "scoreLabel.Good": "Хорошо",
  "scoreLabel.Needs attention": "Требует внимания",
  "scoreLabel.At risk": "В зоне риска",

  "severity.critical": "Критический",
  "severity.high": "Высокий",
  "severity.medium": "Средний",
  "severity.low": "Низкий",

  "issue.one": "проблема",
  "issue.few": "проблемы",
  "issue.many": "проблем",
  "points.one": "балл",
  "points.few": "балла",
  "points.many": "баллов",
  "cores.one": "ядро",
  "cores.few": "ядра",
  "cores.many": "ядер",

  "threat.title": "Анализ угроз",
  "threat.desc": "Подтверждённые проблемы по критичности",
  "threat.noIssues": "Нет проблем",
  "threat.allClear": "Подтверждённых проблем нет. Пункты чек-листа без ответа не учитываются.",
  "threat.note":
    "Учитывается только то, что сообщил браузер или вы сами. Ничего не оценивается приблизительно.",

  "privacy.title": "Мониторинг приватности",
  "privacy.desc": "Что раскрывает этот браузер",
  "privacy.browser": "Браузер",
  "privacy.webrtc": "WebRTC",
  "privacy.cookies": "Cookie",
  "privacy.storage": "Локальное хранилище",
  "privacy.signal": "Сигнал приватности",
  "privacy.available": "Доступен",
  "privacy.unavailable": "Недоступен",
  "privacy.enabled": "Включены",
  "privacy.disabled": "Отключены",
  "privacy.storageAvailable": "Доступно",
  "privacy.blocked": "Заблокировано",
  "privacy.sent": "Отправляется",
  "privacy.notSent": "Не отправляется",
  "privacy.recs": "Рекомендации",
  "privacy.nothing": "По данным браузера исправлять нечего.",
  "privacy.details": "Подробнее о приватности",

  "network.title": "Сетевая идентичность",
  "network.desc": "Что сайты видят о вашем соединении",
  "network.publicIp": "Публичный IP",
  "network.ipHint": "Не виден на локальном адресе. Разверните в интернете, чтобы увидеть.",
  "network.showIp": "Показать IP-адрес",
  "network.hideIp": "Скрыть IP-адрес",
  "network.notAvailable": "Недоступно",
  "network.connection": "Соединение",
  "network.connHint": "Этот браузер не сообщает детали соединения.",
  "network.unknown": "Неизвестно",
  "network.dns": "DNS",
  "network.dnsHint": "Веб-страницы не видят, какой резолвер вы используете.",
  "network.notExposed": "Не раскрывается страницам",
  "network.https": "HTTPS",
  "network.encrypted": "Зашифровано",
  "network.localOnly": "Только локально",
  "network.notEncrypted": "Не зашифровано",
  "network.region": "Примерный регион",
  "network.regionFromIp": "По вашему IP-адресу",
  "network.regionFromTz": "По часовому поясу, а не по местоположению",

  "device.title": "Аудит устройства",
  "device.desc": "Данные, которые читает каждый посещаемый сайт",
  "device.browser": "Браузер",
  "device.os": "Операционная система",
  "device.screen": "Экран",
  "device.language": "Язык",
  "device.timezone": "Часовой пояс",
  "device.hardware": "Оборудование",
  "device.coresHidden": "Ядра скрыты",
  "device.touch": "сенсор",
  "device.note":
    "В совокупности эти данные позволяют распознать браузер без cookie.",

  "footprint.title": "Цифровой след",
  "footprint.desc": "Отвечено {answered} из {total} пунктов чек-листа",
  "footprint.done": "Готово",
  "footprint.toFix": "Исправить: {count}",
  "footprint.of": "{yes} из {total}",
  "footprint.notAnswered": "Без ответа",
  "footprint.recs": "Личные рекомендации",
  "footprint.empty": "Ответьте на чек-лист, и здесь появятся следующие шаги.",
  "footprint.noGaps": "В отвеченных пунктах пробелов нет.",
  "footprint.start": "Начать чек-лист",
  "footprint.open": "Открыть чек-лист",

  "history.title": "История аудитов",
  "history.desc": "Сохранено аудитов на устройстве: {count}",
  "history.savedOnly": "Хранится только на этом устройстве",
  "history.all": "Все отчёты",
  "history.empty": "Запустите первый аудит, чтобы отслеживать изменение оценки.",
  "history.blocked":
    "Этот браузер блокирует локальное хранилище, поэтому аудиты не сохраняются. Разрешите хранение для этого сайта, чтобы вести историю.",
  "history.runFirst": "Запустить первый аудит",
  "history.scoreName": "Оценка",

  "group.two-factor": "Двухфакторная аутентификация",
  "group.passwords": "Гигиена паролей",
  "group.accounts": "Безопасность аккаунтов",

  "checklist.yes": "Да",
  "checklist.no": "Нет",

  "audit.title": "Аудит безопасности",
  "audit.desc":
    "Проверки браузера выполняются автоматически. Проверки аккаунтов основаны на ваших ответах, потому что веб-страница не видит, что внутри аккаунтов.",
  "audit.checklistTitle": "Чек-лист аккаунтов",
  "audit.checklistDesc": "Ответы остаются на этом устройстве",
  "audit.allChecks": "Все проверки",
  "audit.checksCount": "Проверок в аудите: {count}",
  "audit.nextSteps": "Следующие шаги",
  "audit.status.pass": "Пройдено",
  "audit.status.warn": "Проверить",
  "audit.status.fail": "Провалено",
  "audit.status.info": "Инфо",
  "audit.status.unknown": "Без ответа",

  "privacyPage.title": "Приватность",
  "privacyPage.desc":
    "Что этот браузер, устройство и соединение раскрывают сайтам. Всё здесь прочитано прямо из браузера.",
  "privacyPage.detail": "Проверки браузера подробно",
  "privacyPage.good": "Хорошо",
  "privacyPage.review": "Проверить",
  "privacyPage.fix": "Исправить",
  "privacyPage.info": "Инфо",

  "reports.title": "Отчёты",
  "reports.desc":
    "Каждый сохранённый аудит хранится в этом браузере. Скачайте отчёт, чтобы сохранить его или поделиться. IP-адрес в него не включается.",
  "reports.download": "Скачать отчёт",

  "dialog.running": "Выполняется аудит безопасности",
  "dialog.runningDesc": "Проверки выполняются в браузере. Ничего не загружается.",
  "dialog.step1": "Читаем данные браузера и устройства",
  "dialog.step2": "Проверяем настройки приватности",
  "dialog.step3": "Проверяем соединение",
  "dialog.step4": "Считаем оценку",
  "dialog.complete": "Аудит завершён",
  "dialog.saved": "Сохранено в истории · аудитов на устройстве: {count}",
  "dialog.first": "Это ваш первый сохранённый аудит.",
  "dialog.same": "Тот же результат, что и в прошлом аудите.",
  "dialog.up": "На {count} {points} больше, чем в прошлом аудите.",
  "dialog.down": "На {count} {points} меньше, чем в прошлом аудите.",
  "dialog.coverage":
    "Отвечено {pct}% проверок. Завершите чек-лист для полной оценки.",
  "dialog.fixFirst": "Исправить в первую очередь",
  "dialog.finish": "Завершить чек-лист",
  "dialog.done": "Готово",

  "common.reading": "Читаем ваш браузер",
  "common.dismiss": "Закрыть уведомление",
  "common.close": "Закрыть",

  "check.unanswered": "Пока без ответа.",

  "check.https.label": "Зашифрованное соединение",
  "check.https.detailLocal":
    "Локальный адрес разработки. Трафик не покидает этот компьютер.",
  "check.https.detailSecure": "Страница открыта по HTTPS.",
  "check.https.detailInsecure":
    "Страница открыта по обычному HTTP, поэтому любой в сети может прочитать или изменить её.",
  "check.https.rec": "Откройте приложение по HTTPS, прежде чем вводить личные данные.",

  "check.webrtc.label": "WebRTC",
  "check.webrtc.detailAvailable":
    "Доступен. Сайты могут использовать его, чтобы узнать локальные сетевые адреса. Мы проверили только доступность и не тестировали утечку.",
  "check.webrtc.detailUnavailable": "Недоступен в этом браузере.",
  "check.webrtc.rec":
    "Если вы используете VPN, проверьте утечки WebRTC и рассмотрите настройку браузера или расширение, ограничивающее WebRTC.",

  "check.gpc.label": "Global Privacy Control (GPC)",
  "check.gpc.detailOn": "Ваш браузер сообщает сайтам, что не продавать и не передавать ваши данные.",
  "check.gpc.detailOff":
    "Ваш браузер не отправляет сигнал с просьбой не продавать и не передавать ваши данные.",
  "check.gpc.rec":
    "Включите Global Privacy Control или используйте браузер/расширение, которое отправляет этот сигнал.",

  "check.cookies.label": "Cookie",
  "check.cookies.detailOn":
    "Включены. Страница не может прочитать вашу политику сторонних cookie, поэтому проверьте её в настройках браузера.",
  "check.cookies.detailOff": "Отключены для этого сайта. Некоторые функции могут не работать.",

  "check.storage.label": "Локальное хранилище",
  "check.storage.detailOn":
    "Доступно. Посещаемые сайты могут хранить данные на этом устройстве, пока вы их не очистите.",
  "check.storage.detailOff":
    "Заблокировано. История аудитов не может сохраняться на этом устройстве.",

  "check.dnt.label": "Do Not Track",
  "check.dnt.detailOn": "Включён. Большинство сайтов его игнорируют, поэтому сам по себе он защищает мало.",
  "check.dnt.detailOff":
    "Выключен или не передаётся. Большинство сайтов всё равно игнорируют эту настройку.",

  "checklistItem.2fa-email.label": "Двухфакторный вход в основную почту",
  "checklistItem.2fa-email.hint":
    "Через почту можно сбросить пароль от всех остальных аккаунтов.",
  "checklistItem.2fa-email.rec":
    "Сначала включите двухфакторный вход для основной почты. Предпочтите приложение-аутентификатор или аппаратный ключ SMS.",
  "checklistItem.2fa-other.label": "Двухфакторный вход в банковские и социальные аккаунты",
  "checklistItem.2fa-other.hint": "Касается аккаунтов, где хранятся деньги или данные вашей личности.",
  "checklistItem.2fa-other.rec":
    "Включите двухфакторный вход для банковских, социальных аккаунтов и облачных хранилищ, начиная с самого важного.",
  "checklistItem.unique-passwords.label": "У каждого важного аккаунта свой пароль",
  "checklistItem.unique-passwords.hint":
    "Один утёкший пароль не должен открывать второй аккаунт.",
  "checklistItem.unique-passwords.rec":
    "Замените повторно используемые пароли, начиная с почты, банка и аккаунтов с платёжными данными.",
  "checklistItem.password-manager.label": "Я использую менеджер паролей",
  "checklistItem.password-manager.hint": "Делает длинные уникальные пароли удобными.",
  "checklistItem.password-manager.rec":
    "Настройте менеджер паролей и сначала перенесите в него самые важные аккаунты.",
  "checklistItem.recovery-current.label": "Резервная почта и телефон актуальны",
  "checklistItem.recovery-current.hint": "Помогает вернуть доступ и не пускает других.",
  "checklistItem.recovery-current.rec":
    "Проверьте резервную почту и телефон в основных аккаунтах и удалите те, которыми больше не владеете.",
  "checklistItem.app-permissions.label":
    "Я проверил приложения, подключённые к аккаунтам, за этот год",
  "checklistItem.app-permissions.hint":
    "Старые подключения «Войти через…» сохраняют доступ.",
  "checklistItem.app-permissions.rec":
    "Откройте страницу подключённых приложений в Google, Apple и соцсетях и удалите то, чем больше не пользуетесь.",
  "checklistItem.auto-updates.label": "Обновления браузера и ОС устанавливаются автоматически",
  "checklistItem.auto-updates.hint":
    "Большинство атак использует уязвимости, для которых уже есть исправление.",
  "checklistItem.auto-updates.rec":
    "Включите автоматические обновления браузера и операционной системы.",
};

Object.assign(en, extraEn);
Object.assign(ru, extraRu);

const dictionaries: Record<Locale, Dict> = { en, ru };

export type TranslateParams = Record<string, string | number>;

export function translate(locale: Locale, key: string, params?: TranslateParams): string {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  let value = dict[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
  if (params) {
    value = value.replace(/\{(\w+)\}/g, (match, name: string) =>
      params[name] !== undefined ? String(params[name]) : match,
    );
  }
  return value;
}

function pluralForm(locale: Locale, n: number): "one" | "few" | "many" {
  if (locale === "en") return n === 1 ? "one" : "many";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "one";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "few";
  return "many";
}

/** Pluralized lookup: expects `baseKey.one`, `baseKey.few`, `baseKey.many`. */
export function translatePlural(
  locale: Locale,
  baseKey: string,
  n: number,
  params?: TranslateParams,
): string {
  return translate(locale, `${baseKey}.${pluralForm(locale, n)}`, { count: n, ...params });
}
