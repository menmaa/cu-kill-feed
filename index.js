module.exports = function CUKillFeed(mod) {
	
	let loaded = false;
	let hooks = [];
	let guildMap = new Map();
	
	mod.hook('S_LOAD_TOPO', 3, (event) => {
		if(event.zone === 152) load();
		else unload();
	});
	
	function load() {
		if(loaded) return;
		
		hook('S_RETURN_TO_LOBBY', 1, () => {
			unload();
		});
		
		hook('S_USER_DEATH', 1, (event) => {
			if(event.killerName.length > 0) {
				sendSystemMessage(event);
			}
		});
		
		hook('S_SPAWN_USER', 15, (event) => {
			if(!guildMap.has(event.name)) {
				guildMap.set(event.name, event.guildName);
			}
		});
		
		loaded = true;
	}
	
	function unload() {
		if(!loaded) return;
		
		for(let h of hooks) {
			mod.unhook(h);
		}
		
		hooks = [];
		guildMap.clear();
		loaded = false;
	}
	
	function sendSystemMessage(e) {
		switch(e.type) {
			case 0: {
				if(!guildMap.has(e.name)) {
					mod.hookOnce('S_USER_PAPERDOLL_INFO', 10, (event) => {
						guildMap.set(event.name, event.guild);
						sendSystemMessage(e);
						return false;
					});
					mod.send('C_REQUEST_USER_PAPERDOLL_INFO', 2, { name: e.name });
				} else {
					let message = mod.buildSystemMessage('SMT_CITYWAR_GUILD_KILL', {
						Name1: e.killerName,
						GuildName2: guildMap.get(e.name),
						Name2: e.name
					});
					mod.send('S_SYSTEM_MESSAGE', 1, { message });
				}
				break;
			}
			case 1: {
				if(!guildMap.has(e.killerName)) {
					mod.hookOnce('S_USER_PAPERDOLL_INFO', 10, (event) => {
						guildMap.set(event.name, event.guild);
						sendSystemMessage(e);
						return false;
					});
					mod.send('C_REQUEST_USER_PAPERDOLL_INFO', 2, { name: e.killerName });
				} else {
					let message = mod.buildSystemMessage('SMT_CITYWAR_GUILD_DEATH', {
						Name1: e.name,
						GuildName2: guildMap.get(e.killerName),
						Name2: e.killerName
					});
					mod.send('S_SYSTEM_MESSAGE', 1, { message });
				}
				break;
			}
		}
	}
	
	function hook() {
		hooks.push(mod.hook(...arguments));
	}
}