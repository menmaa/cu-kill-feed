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
			// Old Definition Compatibility
			if(event.type && event.killerName.length > 0) {
				sendSystemMessage({
					killed: (event.type == 1),
					name: event.name,
					killer: event.killerName
				});
				return;
			}
			
			if(event.killer.length > 0) {
				sendSystemMessage(event);
			}
		});
		
		hook('S_SPAWN_USER', 16, (event) => {
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
		
		let Name1 = (e.killed ? e.name : e.killer);
		let Name2 = (e.killed ? e.killer : e.name);
		let smt = `SMT_CITYWAR_GUILD_${e.killed ? 'DEATH' : 'KILL'}`;
		
		if(!guildMap.has(Name2)) {
			mod.hookOnce('S_USER_PAPERDOLL_INFO', 15, (event) => {
				guildMap.set(event.name, event.guild);
				sendSystemMessage(e);
				return false;
			});
			mod.send('C_REQUEST_USER_PAPERDOLL_INFO', 4, { name: Name2 });
			return;
		}
		
		let message = mod.buildSystemMessage(smt, {
			Name1,
			GuildName2: guildMap.get(Name2),
			Name2
		});
		mod.send('S_SYSTEM_MESSAGE', 1, { message });
	}
	
	function hook() {
		hooks.push(mod.hook(...arguments));
	}
}