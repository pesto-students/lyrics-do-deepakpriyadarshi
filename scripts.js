/*
    Name: L4Lyrics App JS Functions
    Description: NA
    Version: 1.0.0
    Author: Deepak Priyadarshi
    Website: https://www.deepakpriyadarshi.com/
*/

/* These loaders are used to display in the waiting while searching for songs or displaying lyrics or songs not found. */
const SONG_LOADER = `<center><img class="song-loader" src="assets/music.png" width="100px" height="100px"/><h4 class="text-white">wait while we load your songs</h4></center>`;
const LYRICS_LOADER = `<center><img class="song-loader" src="assets/music.png" width="100px" height="100px"/><h4 class="text-white">wait while we load your lyrics</h4></center>`;
const SONGS_NOT_FOUND = `<center><img src="assets/song_not_found.png" width="300px"/><h5 class="text-white">We hate it as much you do</h5><h5 class="text-white">but we were not able to find any songs.</h5></center>`;

var songs_result = document.getElementById("songs-list");
songs_result.style.display = "none";

/* When search button is clicked it will call the searchSongs() function. */
let search_button = document.getElementById("search-songs");
search_button.addEventListener("click", searchSongs);

/* When previous button is clicked it will call the getPreviousSongs() function. */
document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "previous-page-btn") { getPreviousSongs(); }
});

/* When next button is clicked it will call the getNextSongs() function. */
document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "next-page-btn") { getNextSongs(); }
});

/* When show lyrics button is clicked, it gets the artist and song title from the data attribute and calls the getLyrics() function. */
document.addEventListener("click", function (e) {
    if (e.target && e.target.className === "show-lyrics-btn") {

        let song_artist = e.target.dataset.artist;
        let song_title = e.target.dataset.title;

        getLyrics(song_artist, song_title);
    }
});


/* Lyrics Modal Starts Here */

var lyrics_modal = document.getElementById("song-lyrics-modal");

// When clicked on <span> (x), close the modal
var lyrics_modal_close = document.getElementsByClassName("close")[0];
lyrics_modal_close.onclick = function () { lyrics_modal.style.display = "none"; }

// When clicked anywhere outside of the modal, close it
window.onclick = function (event) { if (event.target == lyrics_modal) { lyrics_modal.style.display = "none"; } }

/* Lyrics Modal Ends Here */


/* Song & Lyrics Functions Starts Here */

function searchSongs() {
    let search_keyword = document.getElementById("search_keyword").value;
    let search_keywprd_msg = document.getElementById("search-keyword-msg");

    if (search_keyword.length < 1) {
        search_keywprd_msg.innerHTML = `<div class="search-input-msg">Hey, I need Something To Search</div>`;
        return false;
    }

    getSongs(search_keyword);
}

async function getSongs(search_keyword) {
    songs_result.style.display = "block";
    songs_result.innerHTML = SONG_LOADER;

    search_keyword = encodeURI(search_keyword);

    let url = "https://api.lyrics.ovh/suggest/" + search_keyword;

    fetch(url)
        .then((resp) => resp.json())
        .then(function (data) {
            window.localStorage.setItem("songs", JSON.stringify(data));

            loadSongs();
        }).catch(function (error) {
            console.log(error);
        });
}

async function getNextSongs() {

    songs_result.innerHTML = SONG_LOADER;

    let songs = JSON.parse(window.localStorage.getItem("songs"));

    let url = songs.next.replace("http://", "https://");

    fetch(url)
        .then((resp) => resp.json())
        .then(function (data) {
            window.localStorage.setItem("songs", JSON.stringify(data));

            loadSongs();
        }).catch(function (error) {
            console.log(error);
        });
}

async function getPreviousSongs() {

    songs_result.innerHTML = SONG_LOADER;

    let songs = JSON.parse(window.localStorage.getItem("songs"));

    let url = songs.prev.replace("http://", "https://");

    fetch(url)
        .then((resp) => resp.json())
        .then(function (data) {
            window.localStorage.setItem("songs", JSON.stringify(data));

            loadSongs();
        }).catch(function (error) {
            console.log(error);
        });
}

function loadSongs() {

    let songs = JSON.parse(window.localStorage.getItem("songs"));

    let songs_list = songs.data;

    let songs_html = "";

    if (songs_list.length <= 0) {
        songs_result.innerHTML = SONGS_NOT_FOUND;
        return false;
    }

    for (let sng_i = 0; sng_i < songs_list.length; sng_i++) {

        let song = songs_list[sng_i];

        songs_html += `
        <div class="song">
            <div class="song-details">
                <img src="`+ song.album.cover_small + `" />
            </div>
            <div class="artist-details">
                <h5 class="song-title">`+ song.title + `</h5>
                <a class="song-artist-name" href="`+ song.artist.link + `" target="_blank"><strong>Artist:</strong> ` + song.artist.name + `</a>
                <br><br>Preview:
                <audio style="width: 250px; height: 20px;" controls>
                    <source src="`+ song.preview + `" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <br>
            </div>
            <br>
            <a href="javascript:void(0);" data-artist="` + song.artist.name + `" data-title="` + song.title + `" class="show-lyrics-btn">Show Lyrics</a>
        </div>
        `;
    }

    let PREVIOUS_BUTTON = `<a href="javascript:void(0);" id="previous-page-btn">PREVIOUS</a>`;
    let NEXT_BUTTON = `<a href="javascript:void(0);" id="next-page-btn">NEXT</a>`;

    songs_html += `
        <div class="navigation-block">
            <div class="previous">
                `+ ((songs.prev === undefined || songs.prev === null || songs.prev.trim() == "") ? "" : PREVIOUS_BUTTON) + `
            </div>
            <div class="next">
            `+ ((songs.next === undefined || songs.next === null || songs.next.trim() == "") ? "" : NEXT_BUTTON) + `
            </div>
        </div>
    `;

    songs_result.innerHTML = "";
    songs_result.innerHTML = songs_html;
}

async function getLyrics(song_artist, song_title) {

    let lyrics_details = document.getElementById("song-lyrics-details");
    lyrics_details.innerHTML = SONG_LOADER;

    song_artist = encodeURI(song_artist);
    song_title = encodeURI(song_title);

    let lyrics_url = "https://api.lyrics.ovh/v1/" + song_artist + "/" + song_title;

    fetch(lyrics_url)
        .then((resp) => resp.json())
        .then(function (data) {

            song_artist = decodeURI(song_artist);
            song_title = decodeURI(song_title);

            let lyrics_html = `
            <h5>`+ song_title + `</h5>
            <h6>By: `+ song_artist + `</h6>
            <div>`+ (data.lyrics.trim() == "" ? "Sorry, we were not able to find any lyrics" : data.lyrics.replace(/[\r\n]/g, "<br>")) + `</div>
            `;

            lyrics_details.innerHTML = lyrics_html;
            lyrics_modal.style.display = "block";

        }).catch(function (error) {
            console.log(error);
        });
}

/* Song & Lyrics Functions Ends Here */