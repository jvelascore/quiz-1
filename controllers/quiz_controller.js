var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

//Autoload - factoriza el código si ruta incluye :quizId
exports.load =function(req, res, next, quizId) {
	models.Quiz.find({
		    where: { id: Number(quizId) },
		    include: [{ model: models.Comment }]
		}).then(function(quiz){
			if (quiz){
				req.quiz = quiz;
				next();
			}	else{ next(new Error ('No existe quizId=' + quizId));}
		}
	).catch (function(error){next(error);});
};



//GET /quizes
exports.index = function(req, res){


var qer=( req.query.search||"").replace(/\s/g,'%');
qer='%'+ qer +'%';

  models.Quiz.findAll({where: ["pregunta like ?", qer], order: [['pregunta','ASC']]}).then(
     function(quizes){
       res.render('quizes/index.ejs', { quizes: quizes, errors: [], title: 'Quiz'});
     }
  ).catch(function(error) { next(error);}) 
};




//GET/quizes/id


//GET / quizes
//exports.index= function(req,res){
//	models.Quiz.findAll().then(
//		function(quizes){
//			res.render('quizes/index.ejs',{quizes: quizes, errors: []});
//	}).catch (function(error){next(error)});
//};

//GET/quizes/:id

exports.show = function(req, res){
   res.render('quizes/show', {quiz: req.quiz, errors: []});
};

//GET/quizes/:id/answer
exports.answer = function(req, res){
   var resultado ='Incorrecto';
	if(req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render(
		'quizes/answer',
		{ quiz: req.quiz,
		  respuesta: resultado,
		  errors: []
		}
	);	
};


// GET /quizes/new

exports.new = function(req, res){
	var quiz =models.Quiz.build( //crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);

	res.render('quizes/new', {quiz: quiz, errors: []});
};

//POST /quizes/create

exports.create = function(req,res){
	req.body.quiz.UserId = req.session.user.id;
	var quiz = models.Quiz.build (req.body.quiz);

	quiz
	.validate()
	.then(
		function(err){
			if (err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				quiz //save: guarda en DB campos pregunta y respuesta de quiz
				.save({fields: ["pregunta", "respuesta", "UserId"]})
				.then( function(){res.redirect('/quizes')})
			}
		}
	).catch(function(error){next(error)});
};

exports.author = function(req, res) {

    res.render('author', {errors: []});
};

exports.edit = function(req, res) {
	var quiz = req.quiz; // autoload de instancia de quiz
	res.render('quizes/edit', {quiz:quiz, errors: []});
};

exports.update = function(req,res){
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

    req.quiz
	.validate()
	.then(
		function(err){
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz //save: guarda en DB campos pregunta y respuesta de quiz
				.save( {fields: ["pregunta", "respuesta"]})
				.then( function(){res.redirect('/quizes');});
			}
		}
	);
};

//DELETE /quizes/:id
exports.destroy = function (req,res){
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};