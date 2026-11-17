window.WEDDING_RSVP_CONFIG = {
  "title": "Подтвердите присутствие",
  "deadline": "до 1 июня 2027 года",
  "questions": [
    {
      "id": "drinks",
      "title": "Какие напитки предпочитаете?",
      "type": "multiple",
      "required": false,
      "options": [
        "Вино",
        "Игристое",
        "Крепкий алкоголь",
        "Безалкогольные"
      ],
      "showIf": {
        "field": "attendance",
        "equals": "yes"
      }
    },
    {
      "id": "transfer",
      "title": "Понадобится ли трансфер?",
      "type": "single",
      "required": true,
      "options": [
        "Да",
        "Нет",
        "Пока не знаю"
      ],
      "showIf": {
        "field": "attendance",
        "equals": "yes"
      }
    },
    {
      "id": "pickup",
      "title": "Где вам удобнее сесть в автобус?",
      "type": "single",
      "required": false,
      "options": [
        "У метро",
        "В центре города",
        "У ресторана"
      ],
      "showIf": {
        "field": "transfer",
        "equals": "Да"
      }
    },
    {
      "id": "song",
      "title": "Какую песню хотите услышать?",
      "type": "text",
      "required": false,
      "options": [],
      "showIf": {
        "field": "attendance",
        "equals": "yes"
      }
    }
  ]
};
