var models = require('../models/models.js');

exports.question = function(req, res){
	models.Quiz.findAll().success(function(quiz){
    res.render('quizes/question', {pregunta: 'capital de Italia'});
  })
};

exports.answer = function(req, res){
   models.Quiz.findAll().success(function(quiz){}	
	if(req.query.respuesta === quiz[0].respuesta){
		res.render('quizes/answer', {respuesta: 'Correcto'});
	}else{
		res.render('quizes/answer', {respuesta: 'Incorrecto'})
	}
  })	
};
