module.exports = function() {
	return bttv.getChatController() ? bttv.getChatController().currentRoom : false;
}