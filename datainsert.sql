create table User(
	uid varchar(50) primary key not null,
	name varchar(100) not null,
	pass varchar(200) not null,
	city varchar(100) not null,
	emailID varchar(100) not null
);

create table Artist(
	aid varchar(100) not null PRIMARY KEY,
	aname varchar(100) not null,
	atype varchar(50),
	ades varchar(300)
);

create table Songs(
	sid varchar(100) not null PRIMARY KEY,
	stitle varchar(100) not null,
	sgenre varchar(100),
	sduration int not null,
	aid varchar(100) not null,
	foreign key(aid) references Artist(aid)
);

create table Album(
	abid varchar(100) not null PRIMARY KEY,
	abtitle varchar(100) not null,
	abissuedt DateTime not null,
	abcount int not null
);

create table AlbumSong(
	abid varchar(100) not null,
	sid varchar(100) not null,
	snumber int,
	foreign key(abid) references Album(abid),
	foreign key(sid) references Songs(sid),
	primary key(abid,sid)
);

create table PlayList(
	pid int AUTO_INCREMENT not null PRIMARY KEY,
	uid varchar(50) not null,
	ptitle varchar(100) not null,
	ptype varchar(50) not null,
	preldt DateTime not null,
	foreign key(uid) references User(uid)
);

create table PlTrack(
	pid int not null,
	sid varchar(100) not null,
	snumber int,
	primary key(pid,sid),
	foreign key(pid) references PlayList(pid),
	foreign key(sid) references Songs(sid)
);

create table Plays(
	uid varchar(50) not null,
	pid int,
	sid varchar(100) not null,
	abid varchar(100),
	playstime DateTime not null,
	primary key(uid,sid,playstime),
	foreign key(uid) references User(uid),
	foreign key(sid) references Songs(sid),
	foreign key(pid) references PlayList(pid),
	foreign key(abid) references Album(abid)
);

create table Likes(
	uid varchar(50) not null,
	aid varchar(100) not null,
	likedt DateTime not null,
	foreign key(uid) references User(uid),
	foreign key(aid) references Artist(aid),
	primary key(uid, aid)
);


create table Rating(
	uid varchar(50) not null,
	sid varchar(100) not null,
	rating int not null,
	rdate DateTime not null,
	primary key(uid,sid),
	foreign key(uid) references User(uid),
	foreign key(sid) references Songs(sid)
);

create table Followers(
	uid varchar(50) not null, 
	unamefollow varchar(50) not null,
	followdt DateTime not null,
	primary key(uid,unamefollow),
	foreign key(uid) references User(uid),
	foreign key(unamefollow) references User(uid)
);


SET FOREIGN_KEY_CHECKS = 0;
LOAD DATA LOCAL INFILE "path to the file/Artists.csv" INTO TABLE Artist FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n';
LOAD DATA LOCAL INFILE "path to the file/Albums.csv" INTO TABLE Album FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n';
LOAD DATA LOCAL INFILE "path to the file/Tracks.csv" INTO TABLE Songs FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' (@sid, @stitle, @sgenre, @sduration, @aid, @index) set sid=@sid, stitle=@stitle,sduration=@sduration,aid=@aid,sgenre=@sgenre;
LOAD DATA LOCAL INFILE "path to the file/AlbumSong.csv" INTO TABLE AlbumSong FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n';


//Procedure for storing new user

CREATE DEFINER=`root`@`localhost` PROCEDURE `new_user`(IN `p_user_name` varchar(50),IN `p_uname` varchar(100),IN `p_pass` varchar(200),IN `p_city` varchar(100),IN `p_emailID` varchar(100))
NO SQL
Insert into user (uid, name, pass, city, emailID)
values (p_user_name, p_uname, p_pass, p_city, p_emailID);
	 
// Procdeure for fetching search result//


CREATE DEFINER=`root`@`localhost` procedure `SearchTracks`(IN `keyword` varchar(100),IN `u_username` varchar(50)) NO SQL select s.sid,stitle, sduration, aname from songs s join artist a on s.aid = a.aid where stitle like concat('%',keyword, '%') or aname like concat('%',keyword, '%') union select s.sid,stitle, sduration, aname from songs s join Artist a on a.aid = s.aid join albumsong absg on absg.sid = s.sid join album ab on ab.abid = absg.abid where abtitle like concat('%',keyword, '%') union select s.sid,stitle,sduration, aname from playlist p join pltrack ps on p.pid = ps.pid join songs s on s.sid = ps.sid join artist a on a.aid = s.aid where ptitle like concat('%',keyword, '%') and ptype = 'public' union select s.sid,stitle,sduration, aname from playlist p join pltrack ps on p.pid = ps.pid join songs s on s.sid = ps.sid join artist a on a.aid = s.aid join followers f on p.uid = f.uid where p.uid in (select unamefollow from followers where uid = u_username) and ptitle like concat('%',keyword, '%');

DROP PROCEDURE SearchTracks;

CREATE DEFINER=`root`@`localhost` procedure `SearchTracks`(IN `keyword` varchar(100),IN `u_username` varchar(50))
NO SQL
select s.sid, s.stitle, s.sduration, a.aname, a.aid
from songs s, artist a
where s.aid = a.aid and (s.stitle like concat('%', keyword, '%') or a.aname like concat('%',keyword,'%'))
union
select s.sid, s.stitle, s.sduration, a.aname, a.aid
from songs s, Artist a, albumsong absg, album ab
where a.aid = s.aid and absg.sid = s.sid and ab.abid = absg.abid and ab.abtitle like concat('%',keyword, '%')
union
select s.sid, s.stitle, s.sduration, a.aname, a.aid
from playlist p, pltrack ps, songs s, artist a
where p.pid = ps.pid and s.sid = ps.sid and a.aid = s.aid and p.ptitle like concat('%',keyword, '%') and p.ptype = 'public';
				
//create playlist

CREATE DEFINER=`root`@`localhost` PROCEDURE `new_playlist`(IN `u_name` varchar(50),IN `p_name` varchar(100),IN `p_type` varchar(50))
NO SQL
Insert into playlist (uid, ptitle, ptype, preldt)
values (u_name, p_name, p_type, NOW());