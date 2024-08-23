const express = require('express');
const cors = require('cors');
const { ObjectId } = require('mongodb');
const morgan = require('morgan')
const { connectToDb, getDb } = require('./db');
require('donenv').config();


const app = express();
app.use(express.json());

app.use(cors(), morgan('combined'));

app.get('/', (req, res) => {
    res.send('Heeloooooo Dear Edgar!!!! You maza fucker the best!!!!!')
})



//-------------------------------------------------Брекпоинт для показа всех данных в колекции  ---------------------------------------------------------
// Обработчик GET-запросов на маршрут '/students'.
app.get('/students', (req, res) => {
    // Инициализируем пустой массив для хранения данных о студентах.
    const dataStudents = [];
    // Используем объект базы данных `db` для подключения к коллекции 'students'.
    db
        .collection('data-student') // Выбираем коллекцию 'students' в базе данных.
        .find() // Выполняем запрос на получение всех документов в коллекции.
        .forEach((student) => dataStudents.push(student)) // Для каждого найденного документа (студента) добавляем его в массив `students`.
        .then(() => { // После завершения обработки всех документов...
            res
                .status(200) // Устанавливаем HTTP статус 200 (ОК) для успешного запроса.
                .json(dataStudents); // Отправляем массив `students` в формате JSON в ответе клиенту.
        })
        .catch(() => {
            res
                .status(500)
                .json({ error: "Something goes wrong..." })
        })
});
//--------------------------------------------------------------------------------------------------------------------------------------------------------
//-------------------------------------------------Брекпоинт получения элемента по :id  ---------------------------------------------------------
/* app.get('/students/:id', (req, res) => {
    let studentId;
    try {
        studentId = new ObjectId(req.params.id); // Используем new для создания экземпляра ObjectId
    } catch (error) {
        return res
        .status(400)
        .json({ error: "Invalid ID format" }); // Обработка неправильного формата ID
    }

    db.collection('data-student')
        .findOne({ _id: studentId })
        .then((doc) => {
            if (doc) {
                res
                .status(200)
                .json(doc); // Если документ найден, отправляем его
            } else {
                res
                .status(404)
                .json({ error: "Student not found" }); // Если документ не найден
            }
        })
        .catch((err) => {
            res
            .status(500)
            .json({ error: "Something goes wrong..." }); // Обработка ошибок при запросе
        });
});   */

// Получение элемента по имени свойства
app.get('/students/:name', async (req, res) => {
    try {
        // Извлекаем значение параметра "name" из URL.
        const studentName = req.params.name;

        // Используем регулярное выражение для поиска, независимого от регистра.
        const query = { name: new RegExp(`^${studentName}$`, 'i') };

        // Используем объект базы данных `db` для подключения к коллекции 'data-student'.
        const students = await db
            .collection('data-student') // Выбираем коллекцию 'data-student' в базе данных.
            .find(query) // Выполняем запрос на получение всех документов, где поле "name" соответствует регулярному выражению.
            .toArray(); // Преобразуем курсор в массив.

        if (students.length === 0) {
            // Если не найдено ни одного студента, отправляем сообщение о том, что ничего не найдено
            return res.status(404).json({ error: "No students found with this name" });
        }

        // Отправляем массив `students` в формате JSON в ответе клиенту.
        res.status(200).json(students);
    } catch (error) {
        // Обрабатываем ошибки и отправляем ответ с кодом 500 и сообщением об ошибке.
        res
        .status(500)
        .json({ error: "Something went wrong..." });
    }
});
//#########################################################################################################
//---------------------------------------------------------------------------------------------------------
//Удаление элемента
//-----------------------------------------------------
app.delete('/students/:id', (req, res) => {
    let studentId;
    try {
        studentId = new ObjectId(req.params.id); // Используем new для создания экземпляра ObjectId
    } catch (error) {
        return res
        .status(400)
        .json({ error: "Invalid ID format" }); // Обработка неправильного формата ID
    }

    db
    .collection('data-student')
    .deleteOne({ _id: studentId })
    .then((doc) => {
            if (doc) {
                res
                .status(200)
                .json(doc); // Если документ найден, отправляем его
            } else {
                res
                .status(404)
                .json({ error: "Student not found" }); // Если документ не найден
            }
        })
        .catch((err) => {
            res
            .status(500)
            .json({ error: "Something goes wrong..." }); // Обработка ошибок при запросе
        });
});
//##########################################################################################
//------------------------------------------------------------------------------------------
//Добавление нового элемента в коллекцию
app.post('/students', (req, res) => {
    db
    .collection('data-student')
    .insertOne(req.body)
    .then((result) => {
        res
        .status(201)
        .json(result);
    })
    .catch((err) => {
        res
        .status(500)
        .json({ error: "Something goes wrong..." });
    })
});
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//----------------------------------------------------------------------------------------
//Изменение данных у элемента колеции

 app.patch('/students/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {
        db
        .collection('data-student')
        .updateOne({ _id: new ObjectId(req.params.id) }, {$set: req.body})
        .then((result) => {
            res
            .status(200)
            .json(result);
        })
        .catch((err) => {
            res
            .status(500)
            .json({ error: "Something goes wrong..." })
        })
    } else {
        res
        .status(404)
        .json({ error: "Student not found" }); // Если документ не найден
    }
});
 



let db;
connectToDb((err) => {
    if(!err) {
        app.listen(process.env.PORT, (err) => {
            err ? console.log(err) : console.log(`Server was started on port ${process.env.PORT}`)
        });
        db = getDb();
    } else {
        console.log(`DB connection erro: ${err}`);
    }
})
