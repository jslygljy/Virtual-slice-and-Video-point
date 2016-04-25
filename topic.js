(function($) {
    $.fn.jquizzy = function(settings) {
        var defaults = {
            questions: null,
            startImg: 'images/start.gif',
            endText: '测验',
            shortURL: null,
            sendResultsURL: null,
            resultComments: {
                pass: '恭喜你！通过测试！',
                nopass: '对不起！未通过测试！'
            }
        };
        var config = $.extend(defaults, settings);
        if (config.questions === null) {
            $(this).html('<div class="intro-container slide-container"><h2 class="qTitle">现在没还有题目</h2></div>');
            return;
        }
        var superContainer = $(this),
        answers = [],
        exitFob = '<div class="results-container slide-container"><div class="question-number" style="color:#929292;text-indent: 20px;">' + config.endText + '</div><div class="result-keeper"></div></div><div class="notice">请选择一个选项！</div>',
        contentFob = '',
        questionsIteratorIndex,
        answersIteratorIndex;
        superContainer.addClass('main-quiz-holder');
        for (questionsIteratorIndex = 0; questionsIteratorIndex < config.questions.length; questionsIteratorIndex++) {
            contentFob += '<div class="slide-container"><div class="question-number"><p>测验</p>' + (questionsIteratorIndex + 1) + '/' + config.questions.length + '</div><p class="radioButtonList">单选题</p><div class="question">' + config.questions[questionsIteratorIndex].question + '</div><ul class="answers">';
            contentFob += '<li><span>A</span> ' + config.questions[questionsIteratorIndex].answers[0] + '</li>';
            contentFob += '<li><span>B</span> ' + config.questions[questionsIteratorIndex].answers[1] + '</li>';
            contentFob += '<li><span>C</span> ' + config.questions[questionsIteratorIndex].answers[2] + '</li>';
            contentFob += '<li><span>D</span> ' + config.questions[questionsIteratorIndex].answers[3] + '</li>';
            contentFob += '</ul><div class="nav-container">';
            if (questionsIteratorIndex !== 0) {
                contentFob += '<div class="prev"><a class="nav-previous" href="#">上一题</a></div>';
            }
            if (questionsIteratorIndex < config.questions.length - 1) {
                contentFob += '<div class="next"><a class="nav-next" href="#">下一题</a></div>';
            } else {
                contentFob += '<div class="next final"><a class="nav-show-result" href="#">提交</a></div>';
            }
            contentFob += '</div></div>';
            answers.push(config.questions[questionsIteratorIndex].correctAnswer);
        }
        var topicTitle = '<a class="topic_close"></a>';
        superContainer.html(contentFob + exitFob + topicTitle);
        notice = superContainer.find('.notice'),
        userAnswers = [],
        questionLength = config.questions.length,
        slidesList = superContainer.find('.slide-container');
        function checkAnswers() {
            window.resultArr = [],
            flag = false;
            for (i = 0; i < answers.length; i++) {
                if (answers[i] == userAnswers[i]) {
                    flag = true;
                } else {
                    flag = false;
                }
                window.resultArr.push(flag);
            }
            return window.resultArr;
        }
        function roundReloaded(num, dec) {
            var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
            return result;
        }
        function judgeSkills(score) {
            var returnString;
            if (score === 100) return config.resultComments.pass;
            else return config.resultComments.nopass;
        }
        notice.hide();
        slidesList.hide().first().fadeIn(0);
        superContainer.find('li').click(function() {
            var thisLi = $(this);
            if (thisLi.hasClass('selected')) {
                thisLi.removeClass('selected');
            } else {
                thisLi.parents('.answers').children('li').removeClass('selected');
                thisLi.addClass('selected');
            }
        });
        superContainer.find('.next').click(function() {
            if ($(this).parents('.slide-container').find('li.selected').length === 0) {
                notice.fadeIn(300);
                return false;
            }
            notice.hide();
            $(this).parents('.slide-container').fadeOut(0,
            function() {
                $(this).next().fadeIn(0);
            });
            return false;
        });
        superContainer.find('.prev').click(function() {
            notice.hide();
            $(this).parents('.slide-container').fadeOut(0,
            function() {
                $(this).prev().fadeIn(0);
            });
            return false;
        });
        superContainer.find('.final').click(function() {
            if ($(this).parents('.slide-container').find('li.selected').length === 0) {
                notice.fadeIn(300);
                return false;
            }
            superContainer.find('li.selected').each(function(index) {
                userAnswers.push($(this).parents('.answers').children('li').index($(this).parents('.answers').find('li.selected')) + 1);
            });
            if (config.sendResultsURL !== null) {
                var collate = [];
                for (r = 0; r < userAnswers.length; r++) {
                    collate.push('{"questionNumber":"' + parseInt(r + 1, 10) + '", "userAnswer":"' + userAnswers[r] + '"}');
                }
            }
            var results = checkAnswers(),
            resultSet = '',
            trueCount = 0,
            shareButton = '',
            score,
            url;
            if (config.shortURL === null) {
                config.shortURL = window.location
            };
            for (var i = 0,
            toLoopTill = results.length; i < toLoopTill; i++) {
                if (results[i] === true) {
                    trueCount++;
                }
                resultSet += '<div class="result-row">' + (results[i] === true ? "<div class='correct'>第"+(i + 1)+"题&#40<span>正确</span>&#41</div>": "<div class='wrong'>第"+(i + 1)+"题&#40<span>错误</span>&#41</div>");
                
                resultSet += '</div>';
            }
            score = roundReloaded(trueCount / questionLength * 100, 2);
            
            resultSet = '<h2 class="qTitle">' + judgeSkills(score) + '<br/> 您的分数： ' + score + '</h2>' + shareButton + '<div class="result_bg"><div class="result_list">' + resultSet + '</div></div>';
	        function allTurnflag(){
            	for (var i = 0; i < window.resultArr.length; i++) {
	            	if (!window.resultArr[i]) return false
				}
            	return true 
	        }
	        if(allTurnflag()){
	        	resultSet += '<span class="btn btnOrange btn_org" id="close_dialog">继续观看</span>';
	        }else{
	        	resultSet += '<span class="btn btnOrange btn_org" id="restart">重新开始测验</span>';
	        }
            
            superContainer.find('.result-keeper').html(resultSet).show(0);
            $("#close_dialog").click(function(){
            	$(".main-quiz-holder").hide();
            })
            $(this).parents('.slide-container').fadeOut(0,
            function() {
                $(this).next().fadeIn(0);
            });
            $("#restart").click(function(){
            	userAnswers = [];
            	$(".slide-container").eq(0).show()
            	$(".results-container").hide()
            	superContainer.find('li').removeClass('selected');
            })
            return false;
        });
    };
})(jQuery);