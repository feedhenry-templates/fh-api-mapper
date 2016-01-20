module.exports = function(req, res){
  return res.render('index.html', { guid : process.env.FH_INSTANCE || 'Unknown service GUID' });
};
