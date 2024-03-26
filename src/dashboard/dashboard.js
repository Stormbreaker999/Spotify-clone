import { doc } from "prettier";
import { fetchRequest } from "../api";
import { ENDPOINT, LOADEDTRACKS, SECTIONTYPE, getItemFromLocalStorage, logout, setItemInLocalStorage } from "../common";

const audio=new Audio();
const volume=document.querySelector("#volume");
const playButton=document.querySelector("#play");
const totalSongDuration=document.querySelector("#total-song-duration")
const songDurationCompleted=document.querySelector("#song-duration-completed")
const songProgress=document.querySelector("#progress");
const timeline=document.querySelector("#timeline");
const audioControl=document.querySelector("#audio-control");
const next=document.querySelector("#next");
const prev=document.querySelector("#prev");
let progressInterval;

const onPofileCLick=(event)=>{
    event.stopPropagation();
    const profileMenu=document.querySelector("#profile-menu");
    if(profileMenu.classList.contains("hidden")){
        profileMenu.classList.remove("hidden");
    }
    else{
        profileMenu.classList.add("hidden");
    }
    if(!profileMenu.classList.contains("hidden")){
        profileMenu.querySelector("li#logout").addEventListener("click", logout);
    }
}

const loadUserProfile=async ()=>{
    const defaultImage=document.querySelector("#default-image");
    const profileButton=document.querySelector("#user-profile-btn");
    const displayNameElement = document.querySelector("#display-name");
    const {display_name:displayName, images}=await fetchRequest(ENDPOINT.userinfo);
    if(images?.length){
        defaultImage.classList.add("hidden");
    }
    else{
        defaultImage.classList.remove("hidden");
    }
    profileButton.addEventListener("click", onPofileCLick);
    displayNameElement.textContent=displayName;
}

const formattime=(dur)=>{
    const min=Math.floor(dur/60_000);
    const sec=((dur %6_000)/1000).toFixed(0);
    const formattedTime=sec===60?min+1+":00":min + ':' +(sec<10?"0":"")+sec;
    return formattedTime;
}

const ontrackSelection=(id, event)=>{
    document.querySelectorAll("#tracks .track").forEach(trackItem=>{
        if(trackItem.id===id){
            trackItem.classList.add("bg-gray", "selected");
        }
        else{
            trackItem.classList.remove("bg-gray", "selected");
        }
    })
}

//const timeline=document.querySelector("#time-line")
const onAudioMetaDataCompleted=(id)=>{
    totalSongDuration.textContent=`0:${audio.duration.toFixed(0)}`;
    updateIconsForPlayMode(id);
}

const updateIconsForPlayMode=(id)=>{
    playButton.querySelector("span").textContent=`pause_circle`;
    const playButtontrack=document.querySelector(`#play-track-${id}`);
    playButtontrack.textContent="⏸";
    playButtontrack.setAttribute("data-play", "");
}

const updateIconsForPauseMode=(id)=>{
    playButton.querySelector("span").textContent=`play_circle`;
    const playButtontrack=document.querySelector(`#play-track-${id}`);
    playButtontrack.textContent="▶";
}

const onNowPlayingPlayButtonCLicked=(id)=>{
    
    if(audio.paused){
        audio.play();
        updateIconsForPlayMode(id);
    }
    else{
        audio.pause();
        updateIconsForPauseMode(id);
    }
}

const onPlayTrack=(event, {image, artistsName, name, duration, preview_Url, id})=>{
    const buttonwithdataplay=document.querySelector("[data-play]");
    console.log(buttonwithdataplay);
    if(buttonwithdataplay?.id===`play-track-${id}`){
        audio.pause();
        
        updateIconsForPauseMode(id);
    }
    else{
        console.log(image, artistsName, name, duration, preview_Url, id);
        const nowPlayingSongImage=document.querySelector("#now-playing-image");
        nowPlayingSongImage.src=image.url;
        const nowPlayingSong=document.querySelector("#now-playing-song");
        const nowPlayingSongArtists=document.querySelector("#now-playing-artists");
        nowPlayingSong.textContent=name;
        nowPlayingSongArtists.textContent=artistsName;
        audio.src=preview_Url;
        audio.removeEventListener("loadedmetadata",()=> onAudioMetaDataCompleted(id));
        audio.addEventListener("loadedmetadata",()=> onAudioMetaDataCompleted(id));
        playButton.addEventListener("click", ()=>onNowPlayingPlayButtonCLicked(id));
        
        

        audioControl.setAttribute("data-track-id", id);
        audio.play();
        clearInterval(progressInterval);
        //timeline.addEventListener("click")
        progressInterval=setInterval(()=>{
            if(audio.paused){
                return
            }
            else{
                songDurationCompleted.textContent=`0:${audio.currentTime.toFixed(0)}`;
                songProgress.style.width=`${(audio.currentTime/audio.duration)*100}%`;
            }
        }, 100)
    }    
    
}

const findCurrentTrack=()=>{
    const audioControl=document.querySelector("#audio-control");
    const trackId=audioControl.getAttribute("data-track-id");
    if(trackId){
        const loadedTracks=getItemFromLocalStorage(LOADEDTRACKS);
        const currentTrackIndex=loadedTracks?.findIndex(trk=>trk.id===trackId);
        return {currentTrackIndex, tracks:loadedTracks};
    }
    else{
        return null;
    }
}
const playNextTrack=()=>{
    const {currentTrackIndex=-1, tracks=null}=findCurrentTrack()??{};
    
    if(currentTrackIndex>-1 && currentTrackIndex<tracks?.length-1){
        onPlayTrack(null, tracks[currentTrackIndex+1]);
    }
    
}

const playPrevTrack=()=>{
    const {currentTrackIndex=-1, tracks=null}=findCurrentTrack()??{};
    if(currentTrackIndex>0){
        onPlayTrack(null, tracks[currentTrackIndex-1]);
    }
}

const loadPlaylistTracks=({tracks})=>{
    const trackSections=document.querySelector("#tracks");
    let trackno=1;
    const loadedTracks=[];
    for(let trackItem of tracks.items.filter(item=> item.track.preview_url)){
        let {id, artists, name, album, duration_ms:duration, preview_url:preview_Url}=trackItem.track;
        let track=document.createElement("section");
        track.className="grid p-1 track grid-cols-[50px_2fr_1fr_50px] gap-4 items-center rounded-md hover:bg-light-black text-secondary justify-items-start hover:cursor-pointer";
        let image=album.images.find(img=>img.height===64)
        track.id=id;
        let artistsName=Array.from(artists, artist=>artist.name).join(", ");
        track.innerHTML=
        `<p class="relative w-full flex items-center justify-center justify-self-center"><span class="track-no">${trackno}</span></p>
        <section class="grid grid-cols-[auto_1fr] place-items-center gap-2">
            <img class="h-8 w-8" src="${image.url}" alt="${name}">
            <article class="flex flex-col gap-1 justify-center">
                <h2 class="text-base text-primary truncate">${name}</h2>
                <p class="text-xs truncate">${artistsName}</p>
            </article>
        </section>
        <p class="text-sm">${album.name}</p>
        <p class="text-sm">${formattime(duration)}</p>`;
        track.addEventListener("click", (event)=>ontrackSelection(id, event));
        const playButton=document.createElement("button");
        playButton.id=`play-track-${id}`;
        playButton.className='play w-full absolute left-0 text-lg invisible';
        playButton.textContent="▶";
        playButton.addEventListener("click", (event)=>onPlayTrack(event, {image, artistsName, name, duration, preview_Url, id}));
        track.querySelector("p").appendChild(playButton);
        trackSections.appendChild(track);
        trackno+=1;
        loadedTracks.push({image, artistsName, name, duration, preview_Url, id})
    }
    setItemInLocalStorage(LOADEDTRACKS, loadedTracks);
}

const fillContentForPlaylist=async (playlistId)=>{
    const playlist=await fetchRequest(`${ENDPOINT.playlist}${playlistId}`);
    const coverElement=document.querySelector("#cover-content");
    const {name, description, images, tracks}=playlist;
    coverElement.innerHTML=
    `<section class="grid grid-cols-[auto_1fr] gap-3 ">
    <img class="oject-contain h-48 w-48" src="${images[0].url}" alt="">
    <section><h2 id="playlist-name" class="text-4xl">${name}</h2>
    <p id="Playlist-description">${description}</p>
    <p id="playlist-details">${tracks.items.length} Songs </p>
    </section></section>`;
    const pagecontent=document.querySelector("#page-content");
    pagecontent.innerHTML=
    `<header id="playlist-header" class="mx-8 py-4 border-secondary border-b-[0.5px]">
    <nav class="py-2">
        <ul class="grid grid-cols-[50px_2fr_1fr_50px] gap-4 text-secondary ">
            <li>#</li>
            <li>Title</li>
            <li>Album</li>
            <li>🕑</li>
        </ul>
    </nav>
    </header>
    <section class="px-8 text-secondary mt-4" id="tracks">
    </section>`;
    console.log(playlist);
    loadPlaylistTracks(playlist);
    
}


const onPlaylistItemClick=(event, id)=>{
    console.log(event.target);
    const section={type:SECTIONTYPE.PLAYLIST, playlist:id};
    history.pushState(section, "", `playlist/${id}`);
    loadSection(section);
}

const loadPlaylist=async (endpoint, elementId)=>{
    const {playlists:{items}}=await fetchRequest(endpoint);
    
    const playlistSection=document.getElementById(`${elementId}`);
    playlistSection.innerHTML='';
    for(let {name, description, images, id} of items){
        const playlistItem=document.createElement("section");
        playlistItem.className="rounded p-4  hover:cursor-pointer hover:bg-light-black";
        playlistItem.id=id;
        //console.log(id);
        playlistItem.setAttribute("data-type", "playlist");
        playlistItem.addEventListener("click", (event, id)=>onPlaylistItemClick(event, playlistItem.id));
        const [{url}]=images;
        playlistItem.innerHTML=`<img src=${url} alt="${name}" class="rounded md-2 object-contain shadow-sm">
        <h2 class="text-base font-semibold mb-4 truncate">${name}</h2>
        <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>
        </section>`;
        playlistSection.appendChild(playlistItem);
        
    }
    
}

const fillContentForDashboard=()=>{
    const playlistMap=new Map([["Featured", "featured-playlist-items"], ["top playlists", "top-playlist-items"]])
    let innerHTML="";
    for(let [type, id] of playlistMap){
        innerHTML+=
        `<article class="p-4 ">
        <h1 class="mb-4 text-2xl font-bold capitalize">${type}</h1>
        <section id="${id}s" class="featured-songs grid grid-cols-auto-fill-cards gap-4">
            
        </section>
        
    </article>`;
    }
}

const loadPlaylists=()=>{
    loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlist-items");
    loadPlaylist(ENDPOINT.toplists, "top-playlist-items");
}

const oncontentscroll=(event)=>{
    const {scrollTop}=event.target;
       
        const header=document.querySelector(".header");
        
        if(scrollTop>=header.offsetHeight){
        header.classList.add("sticky", "top-0", "bg-black-secondary");
        header.classList.remove("transparent");
        }
        else{
           header.classList.remove("sticky", "top-0", "bg-black-secondary");
           header.classList.add("transparent");
        }
        if(history.state.type=SECTIONTYPE.PLAYLIST){
            const playlistHeader=document.querySelector("#playlist-header");
            if(scrollTop>=playlistHeader.offsetHeight){
                playlistHeader.classList.add("sticky");
                playlistHeader.classList.add("top-[64px]", "bg-black-secondary");
            }
        }
}

const loadSection=(section)=>{
    if(section.type===SECTIONTYPE.DASHBOARD){
        const pagecontent=document.querySelector("#page-content");
        pagecontent.innerHTML=`<article class="p-4">
        <h1 class="mb-4 text-2xl">Featured Playlists</h1>
        <section id="featured-playlist-items" class="featured-songs grid grid-cols-auto-fill-cards gap-4">
            <section class="rounded p-4 border-solid border-2">
                <img src="https://i.scdn.co/image/ab67706f00000002319bd79eba1610f1f5fe6a4b" alt="">
                <h2 class="text-sm">Name</h2>
                <h3 class="text-xs">Description</h3>
                
            </section>
            
        </section>
        <h1 class="text-2xl mb-4">Top Playlists</h1>
        <section id="top-playlist-items" class="featured-songs grid grid-cols-auto-fill-cards gap-4">
            <section class="rounded p-4 border-solid border-2">
                <img src="https://i.scdn.co/image/ab67706f00000002319bd79eba1610f1f5fe6a4b" alt="">
                <h2 class="text-sm">Name</h2>
                <h3 class="text-xs">Description</h3>
                
            </section>
            
        </section>
    </article>`;

        fillContentForDashboard();
        loadPlaylists();
    }
    else if(section.type=SECTIONTYPE.PLAYLIST){
        fillContentForPlaylist(section.playlist);
    }
    document.querySelector(".content").removeEventListener("scroll", oncontentscroll);
    document.querySelector(".content").addEventListener("scroll", oncontentscroll);
    
}

const onUserPlaylistClick=(id)=>{
    const section={type:SECTIONTYPE.PLAYLIST, playlist:id};
    history.pushState(section, "", `/dashboard/playlist/${id}`);
    loadSection(section);
}

const loadUserPlaylists=async()=>{
    const playlists=await fetchRequest(ENDPOINT.userPlaylist);
    const userPlaylistSection=document.querySelector("#user-playlists > ul");
    userPlaylistSection.innerHTML="";
    for(let {name, id} of playlists.items){
        const li=document.createElement("li");
        li.textContent=name;
        li.className="cursor-pointer hover:text-primary text-sm";
        li.addEventListener("click", ()=>onUserPlaylistClick(id));
        userPlaylistSection.appendChild(li);
    }
}


document.addEventListener("DOMContentLoaded", ()=>{
    loadUserProfile();
    loadUserPlaylists();
    const section ={type:SECTIONTYPE.DASHBOARD};
    history.pushState(section, "", "");

    loadSection(section);
    document.addEventListener("click", ()=>{
        const profileMenu=document.querySelector("#profile-menu");
        if(!profileMenu.classList.contains("hidden")){
            profileMenu.classList.add("hidden");
        }
    })
    volume.addEventListener("change", ()=>{
        audio.volume=volume.value/100;
    })
    timeline.addEventListener("click", (e)=>{
        const timelineWidth=window.getComputedStyle(timeline).width;
        const timeToSeek=(e.offsetX /parseInt(timelineWidth))*audio.duration;
        audio.currentTime=timeToSeek;
        songProgress.style.width=`${(audio.currentTime/audio.duration)*100}%`
    }, false);
    next.addEventListener("click", playNextTrack);
    prev.addEventListener("click", playPrevTrack);
    window.addEventListener("popstate", (event)=>{
        loadSection(event.state);
        
    })
})