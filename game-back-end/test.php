<?php
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods: PUT, GET, POST");
	header('Content-type: application/json');

	function sendResponse($data){
		header('Content-Type: application/json');
		echo json_encode($data);
	}

	function writeJSONFile($data){
		file_put_contents ('game-settings.json', json_encode($data), LOCK_EX);
	}

	function searchGameIndex($array,$id){
		foreach ($array as $key => $val) {
			if ($val['gameId'] == $id) {
				return $key;
			}
		}
		return null;
	}

	function searchPlayerIndex($players,$id){
		foreach ($players as $key => $val) {
			if ($val['id'] == $id) {
				return $key;
			}
		}
		return null;
	}

	function createPlayer($playerId, $isCreator, $time, $nickname){
		$player = array(
			"id" => $playerId,
			"isCreator" => $isCreator,
			"time" => (int)$time,
			"name" => $nickname
		);
		return $player;
	}

	function newGame($gameId, $startTime, $creatorId, $creatorNickname){
		$creator = createPlayer($creatorId, TRUE, 0, $creatorNickname);
		$images = array("sun","glasses","house","car","pan","hand","chair","banana","egg","stickman","flower","eye","foot","tree");
		shuffle($images);

		$newGame = array(
			"gameId" => $gameId,
			"isStarting" => TRUE,
			"isEnded" => FALSE,
			"startTimeStamp" => (int)$startTime + 15000,
			"players" => array($creator),
			"imageOrders" => $images
		);

		return $newGame;
	}

	// Function that Players Other than the Creator Use to Get Game's Data
	function getCurrentGame($allGames, $gameIndex){
		return $allGames[$gameIndex];
	}

	function getCurrentPlayer($allPlayers, $playerIndex){
		return $allPlayers[$playerIndex];
	}

	function isFinished($game){
		foreach ($game["players"] as $key => $val) {
			if ($val['time'] == 0) {
				return FALSE;
			}
		}

		return TRUE;
	}

	// function getScores(gameId){
	// 	$gameIndex = searchGameIndex();
	// 	return;
	// }

	//GLOBAL VARIABLES
	$serverJSON_file = file_get_contents("./game-settings.json");
	$serverJSON_decoded = json_decode($serverJSON_file, true);
	$allGames = $serverJSON_decoded["games"];
	
	$currentGame = array();
	// print_r($json_val['games'][0]);

	// echo '<pre>';
	// print_r($json_val);
	// echo '</pre>';

	$clientJSON_decoded = json_decode(file_get_contents('php://input'), true);
	
	// START A NEW GAME
	if (isset($_GET['start'])){
		$creatorId = $clientJSON_decoded["userId"];
		$creatorNickname = $clientJSON_decoded["nickName"];
		$startTime = $clientJSON_decoded["startTime"];
		$gameId = $clientJSON_decoded["gameId"];

		$currentGame = newGame($gameId, $startTime, $creatorId, $creatorNickname);
		sendResponse($currentGame);

		// Add Newly Created Game to Current List Of Games
		$serverJSON_decoded["games"] = array_merge($allGames, array($currentGame));
		writeJSONFile($serverJSON_decoded);

		return;
	}

	if (isset($_GET['addplayer'])){
		$gameId = $clientJSON_decoded["gameId"];
		$creatorNickname = $clientJSON_decoded["nickName"];
		$userId = $clientJSON_decoded["userId"];

		$currentGameIndex = searchGameIndex($allGames, $gameId);
		$currentGame = getCurrentGame($allGames, $currentGameIndex);
		$currentPlayer = createPlayer($userId, FALSE, '0', $creatorNickname);

		// Add Player To Curent Game's List Of Player
		$currentGame["players"] = array_merge($currentGame["players"] ,array($currentPlayer));
		$serverJSON_decoded["games"][$currentGameIndex] = $currentGame;
		sendResponse($currentGame);

		writeJSONFile($serverJSON_decoded);

		return;
	}

	if (isset($_GET['submitscore'])){
		$gameId = $clientJSON_decoded["gameId"];
		$userId = $clientJSON_decoded["userId"];
		$time = $clientJSON_decoded["time"];

		$currentGameIndex = searchGameIndex($allGames, $gameId);
		$currentGame = getCurrentGame($allGames, $currentGameIndex);
		$allPlayers = $currentGame["players"];
		$currentPlayerIndex = searchPlayerIndex($allPlayers, $userId);
		$currentPlayer = getCurrentPlayer($allPlayers,$currentPlayerIndex);
		$currentPlayer["time"] = $time;

		// Update Current Player's time
		$serverJSON_decoded["games"][$currentGameIndex]["players"][$currentPlayerIndex] = $currentPlayer;
		sendResponse(array("code"=>"200"));

		writeJSONFile($serverJSON_decoded);

		return;
	}
	
	if (isset($_GET['isfinished'])){
		$gameId = $clientJSON_decoded["gameId"];

		$currentGameIndex = searchGameIndex($allGames, $gameId);
		$currentGame = getCurrentGame($allGames, $currentGameIndex);

		
		if (isFinished($currentGame)) {
			$currentGame["isEnded"] = TRUE;
			$serverJSON_decoded["games"][$currentGameIndex] = $currentGame;

			sendResponse(array(
				"isFinished" => TRUE,
				"players" => $currentGame["players"]));

			writeJSONFile($serverJSON_decoded);

		} else {
			sendResponse(array(
				"isFinished" => FALSE));
		}

		return;
		
	}

	if (isset($_GET['getscores'])){
		$gameId = $clientJSON_decoded["gameId"];

		$currentGameIndex = searchGameIndex($allGames, $gameId);
		$currentGame = getCurrentGame($allGames, $currentGameIndex);

		sendResponse($currentGame["players"]);

		return;
		
	}

	
	
	// if($clientJSON_decoded["userId"]){
	// 	$gameIndex = searchGameIndex($serverJSON_decoded["games"], 8055);
	// 	echo $gameIndex;
	// } else {
	// 	echo "b";
	// }

	// echo '<pre>';
	// print_r($allGames);
	// echo '</pre>';
	// writeJSONFile($data);
?>