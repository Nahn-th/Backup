import { open } from 'react-native-quick-sqlite';

let db = null;

// Initialize database and create tables
export const initDatabase = () => {
    try {
        db = open({ name: 'musicapp.db' });

        // Table 1: Songs
        db.execute(`
      CREATE TABLE IF NOT EXISTS Songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist_name_string TEXT,
        genre_string TEXT,
        duration INTEGER,
        path TEXT NOT NULL UNIQUE,
        cover_image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Table 2: Artists
        db.execute(`
      CREATE TABLE IF NOT EXISTS Artists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        cover_image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Table 3: Genres
        db.execute(`
      CREATE TABLE IF NOT EXISTS Genres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        cover_image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Table 4: Playlists
        db.execute(`
      CREATE TABLE IF NOT EXISTS Playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cover_image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Table 5: SongArtists (Many-to-Many)
        db.execute(`
      CREATE TABLE IF NOT EXISTS SongArtists (
        song_id INTEGER,
        artist_id INTEGER,
        PRIMARY KEY (song_id, artist_id),
        FOREIGN KEY (song_id) REFERENCES Songs(id) ON DELETE CASCADE,
        FOREIGN KEY (artist_id) REFERENCES Artists(id) ON DELETE CASCADE
      )
    `);

        // Table 6: SongGenres (Many-to-Many)
        db.execute(`
      CREATE TABLE IF NOT EXISTS SongGenres (
        song_id INTEGER,
        genre_id INTEGER,
        PRIMARY KEY (song_id, genre_id),
        FOREIGN KEY (song_id) REFERENCES Songs(id) ON DELETE CASCADE,
        FOREIGN KEY (genre_id) REFERENCES Genres(id) ON DELETE CASCADE
      )
    `);

        // Table 7: SongPlaylists (Many-to-Many)
        db.execute(`
      CREATE TABLE IF NOT EXISTS SongPlaylists (
        song_id INTEGER,
        playlist_id INTEGER,
        position INTEGER,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (song_id, playlist_id),
        FOREIGN KEY (song_id) REFERENCES Songs(id) ON DELETE CASCADE,
        FOREIGN KEY (playlist_id) REFERENCES Playlists(id) ON DELETE CASCADE
      )
    `);

        // Table 8: PlayHistory
        db.execute(`
      CREATE TABLE IF NOT EXISTS PlayHistory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        song_id INTEGER,
        played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (song_id) REFERENCES Songs(id) ON DELETE CASCADE
      )
    `);

        // Create default genres
        createDefaultGenres();

        console.log('✅ Database initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        return false;
    }
};

// Create default genres
const createDefaultGenres = () => {
    const defaultGenres = [
        'Rock',
        'Pop',
        'Jazz',
        'Classical',
        'Hip Hop',
        'Electronic',
        'Country',
        'R&B',
    ];

    defaultGenres.forEach(genreName => {
        try {
            db.execute('INSERT OR IGNORE INTO Genres (name) VALUES (?)', [genreName]);
        } catch (error) {
            console.error(`Error creating default genre ${genreName}:`, error);
        }
    });
};

// ==================== SONGS ====================

export const getAllSongs = () => {
    try {
        const result = db.execute('SELECT * FROM Songs ORDER BY created_at DESC');
        return result.rows?._array || [];
    } catch (error) {
        console.error('Error getting all songs:', error);
        return [];
    }
};

export const getSongById = id => {
    try {
        const result = db.execute('SELECT * FROM Songs WHERE id = ?', [id]);
        const rows = result.rows?._array || [];
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error getting song by id:', error);
        return null;
    }
};

export const insertSong = song => {
    try {
        const {
            title,
            artist_name_string,
            genre_string,
            duration,
            path,
            cover_image_path,
        } = song;

        // Check if song already exists
        try {
            const checkResult = db.execute('SELECT id FROM Songs WHERE path = ?', [
                path,
            ]);
            const existingRows = checkResult.rows?._array || [];
            if (existingRows.length > 0) {
                return existingRows[0].id;
            }
        } catch (checkError) {
            // Continue to insert
        }

        // Insert new song
        db.execute(
            'INSERT INTO Songs (title, artist_name_string, genre_string, duration, path, cover_image_path) VALUES (?, ?, ?, ?, ?, ?)',
            [
                title,
                artist_name_string || '',
                genre_string || '',
                duration || 0,
                path,
                cover_image_path || '',
            ],
        );

        // Get inserted ID - Quick SQLite returns it directly
        const result = db.execute('SELECT last_insert_rowid() as id');
        const rows = result.rows?._array || [];
        const insertedId = rows.length > 0 ? rows[0].id : null;

        if (insertedId) {
            console.log(`✅ Inserted: ${title} (id: ${insertedId})`);
        }

        return insertedId;
    } catch (error) {
        console.error('❌ Error inserting song:', error.message);
        return null;
    }
};

export const updateSong = (id, updates) => {
    try {
        const { title, cover_image_path, artist_name_string, genre_string } =
            updates;
        const fields = [];
        const values = [];

        if (title !== undefined) {
            fields.push('title = ?');
            values.push(title);
        }
        if (cover_image_path !== undefined) {
            fields.push('cover_image_path = ?');
            values.push(cover_image_path);
        }
        if (artist_name_string !== undefined) {
            fields.push('artist_name_string = ?');
            values.push(artist_name_string);
        }
        if (genre_string !== undefined) {
            fields.push('genre_string = ?');
            values.push(genre_string);
        }

        if (fields.length === 0) return false;

        values.push(id);
        db.execute(`UPDATE Songs SET ${fields.join(', ')} WHERE id = ?`, values);
        return true;
    } catch (error) {
        console.error('Error updating song:', error);
        return false;
    }
};

export const deleteSong = id => {
    try {
        db.execute('DELETE FROM Songs WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting song:', error);
        return false;
    }
};

export const searchSongs = query => {
    try {
        const searchTerm = `%${query}%`;
        const result = db.execute(
            'SELECT * FROM Songs WHERE title LIKE ? OR artist_name_string LIKE ? ORDER BY title',
            [searchTerm, searchTerm],
        );
        return result.rows?._array || [];
    } catch (error) {
        console.error('Error searching songs:', error);
        return [];
    }
};

// ==================== PLAYLISTS ====================

export const getAllPlaylists = () => {
    try {
        const result = db.execute(
            'SELECT * FROM Playlists ORDER BY created_at DESC',
        );
        return result.rows?._array || [];
    } catch (error) {
        console.error('Error getting all playlists:', error);
        return [];
    }
};

export const getPlaylistById = id => {
    try {
        const result = db.execute('SELECT * FROM Playlists WHERE id = ?', [id]);
        const rows = result.rows?._array || [];
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error getting playlist by id:', error);
        return null;
    }
};

export const createPlaylist = (name, cover_image_path = '') => {
    try {
        db.execute('INSERT INTO Playlists (name, cover_image_path) VALUES (?, ?)', [
            name,
            cover_image_path,
        ]);
        const result = db.execute('SELECT last_insert_rowid() as id');
        const rows = result.rows?._array || [];
        return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
        console.error('Error creating playlist:', error);
        return null;
    }
};

export const updatePlaylist = (id, name, cover_image_path) => {
    try {
        const fields = [];
        const values = [];

        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name);
        }
        if (cover_image_path !== undefined) {
            fields.push('cover_image_path = ?');
            values.push(cover_image_path);
        }

        if (fields.length === 0) return false;

        values.push(id);
        db.execute(
            `UPDATE Playlists SET ${fields.join(', ')} WHERE id = ?`,
            values,
        );
        return true;
    } catch (error) {
        console.error('Error updating playlist:', error);
        return false;
    }
};

export const deletePlaylist = id => {
    try {
        db.execute('DELETE FROM Playlists WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting playlist:', error);
        return false;
    }
};

export const searchPlaylists = query => {
    try {
        const searchTerm = `%${query}%`;
        const result = db.execute(
            'SELECT * FROM Playlists WHERE name LIKE ? ORDER BY name',
            [searchTerm],
        );
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error searching playlists:', error);
        return [];
    }
};

export const getSongsByPlaylist = playlistId => {
    try {
        const result = db.execute(
            `SELECT s.*, sp.position 
       FROM Songs s 
       INNER JOIN SongPlaylists sp ON s.id = sp.song_id 
       WHERE sp.playlist_id = ? 
       ORDER BY sp.position`,
            [playlistId],
        );
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error getting songs by playlist:', error);
        return [];
    }
};

// ==================== ARTISTS ====================

export const getAllArtists = () => {
    try {
        const result = db.execute('SELECT * FROM Artists ORDER BY name');
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error getting all artists:', error);
        return [];
    }
};

export const getArtistById = id => {
    try {
        const result = db.execute('SELECT * FROM Artists WHERE id = ?', [id]);
        const rows = result.rows?._array || result.rows || [];
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error getting artist by id:', error);
        return null;
    }
};

export const createArtist = (name, cover_image_path = '') => {
    try {
        db.execute(
            'INSERT OR IGNORE INTO Artists (name, cover_image_path) VALUES (?, ?)',
            [name, cover_image_path],
        );
        const result = db.execute('SELECT id FROM Artists WHERE name = ?', [name]);
        const rows = result.rows?._array || result.rows || [];
        return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
        console.error('Error creating artist:', error);
        return null;
    }
};

export const searchArtists = query => {
    try {
        const searchTerm = `%${query}%`;
        const result = db.execute(
            'SELECT * FROM Artists WHERE name LIKE ? ORDER BY name',
            [searchTerm],
        );
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error searching artists:', error);
        return [];
    }
};

export const getSongsByArtist = artistId => {
    try {
        const result = db.execute(
            `SELECT s.* 
       FROM Songs s 
       INNER JOIN SongArtists sa ON s.id = sa.song_id 
       WHERE sa.artist_id = ? 
       ORDER BY s.title`,
            [artistId],
        );
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error getting songs by artist:', error);
        return [];
    }
};

export const getArtistsBySong = songId => {
    try {
        const result = db.execute(
            `SELECT a.* 
       FROM Artists a 
       INNER JOIN SongArtists sa ON a.id = sa.artist_id 
       WHERE sa.song_id = ?`,
            [songId],
        );
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error getting artists by song:', error);
        return [];
    }
};

// ==================== GENRES ====================

export const getAllGenres = () => {
    try {
        const result = db.execute('SELECT * FROM Genres ORDER BY name');
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error getting all genres:', error);
        return [];
    }
};

export const getGenreById = id => {
    try {
        const result = db.execute('SELECT * FROM Genres WHERE id = ?', [id]);
        const rows = result.rows?._array || result.rows || [];
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error getting genre by id:', error);
        return null;
    }
};

export const createGenre = (name, cover_image_path = '') => {
    try {
        db.execute(
            'INSERT OR IGNORE INTO Genres (name, cover_image_path) VALUES (?, ?)',
            [name, cover_image_path],
        );
        const result = db.execute('SELECT id FROM Genres WHERE name = ?', [name]);
        const rows = result.rows?._array || result.rows || [];
        return rows.length > 0 ? rows[0].id : null;
    } catch (error) {
        console.error('Error creating genre:', error);
        return null;
    }
};

export const updateGenre = (id, name, cover_image_path) => {
    try {
        const fields = [];
        const values = [];

        if (name !== undefined) {
            fields.push('name = ?');
            values.push(name);
        }
        if (cover_image_path !== undefined) {
            fields.push('cover_image_path = ?');
            values.push(cover_image_path);
        }

        if (fields.length === 0) return false;

        values.push(id);
        db.execute(`UPDATE Genres SET ${fields.join(', ')} WHERE id = ?`, values);
        return true;
    } catch (error) {
        console.error('Error updating genre:', error);
        return false;
    }
};

export const deleteGenre = id => {
    try {
        db.execute('DELETE FROM Genres WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting genre:', error);
        return false;
    }
};

export const searchGenres = query => {
    try {
        const searchTerm = `%${query}%`;
        const result = db.execute(
            'SELECT * FROM Genres WHERE name LIKE ? ORDER BY name',
            [searchTerm],
        );
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error searching genres:', error);
        return [];
    }
};

export const getSongsByGenre = genreId => {
    try {
        const result = db.execute(
            `SELECT s.* 
       FROM Songs s 
       INNER JOIN SongGenres sg ON s.id = sg.song_id 
       WHERE sg.genre_id = ? 
       ORDER BY s.title`,
            [genreId],
        );
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error getting songs by genre:', error);
        return [];
    }
};

export const getGenresBySong = songId => {
    try {
        const result = db.execute(
            `SELECT g.* 
       FROM Genres g 
       INNER JOIN SongGenres sg ON g.id = sg.genre_id 
       WHERE sg.song_id = ?`,
            [songId],
        );
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error getting genres by song:', error);
        return [];
    }
};

// ==================== RELATIONSHIPS ====================

export const addSongToPlaylist = (songId, playlistId, position = 0) => {
    try {
        db.execute(
            'INSERT OR REPLACE INTO SongPlaylists (song_id, playlist_id, position) VALUES (?, ?, ?)',
            [songId, playlistId, position],
        );
        return true;
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        return false;
    }
};

export const removeSongFromPlaylist = (songId, playlistId) => {
    try {
        db.execute(
            'DELETE FROM SongPlaylists WHERE song_id = ? AND playlist_id = ?',
            [songId, playlistId],
        );
        return true;
    } catch (error) {
        console.error('Error removing song from playlist:', error);
        return false;
    }
};

export const linkSongArtist = (songId, artistId) => {
    try {
        db.execute(
            'INSERT OR IGNORE INTO SongArtists (song_id, artist_id) VALUES (?, ?)',
            [songId, artistId],
        );
        return true;
    } catch (error) {
        console.error('Error linking song to artist:', error);
        return false;
    }
};

export const unlinkSongArtist = (songId, artistId) => {
    try {
        db.execute('DELETE FROM SongArtists WHERE song_id = ? AND artist_id = ?', [
            songId,
            artistId,
        ]);
        return true;
    } catch (error) {
        console.error('Error unlinking song from artist:', error);
        return false;
    }
};

export const linkSongGenre = (songId, genreId) => {
    try {
        db.execute(
            'INSERT OR IGNORE INTO SongGenres (song_id, genre_id) VALUES (?, ?)',
            [songId, genreId],
        );
        return true;
    } catch (error) {
        console.error('Error linking song to genre:', error);
        return false;
    }
};

export const unlinkSongGenre = (songId, genreId) => {
    try {
        db.execute('DELETE FROM SongGenres WHERE song_id = ? AND genre_id = ?', [
            songId,
            genreId,
        ]);
        return true;
    } catch (error) {
        console.error('Error unlinking song from genre:', error);
        return false;
    }
};

// ==================== PLAY HISTORY ====================

export const addSongToHistory = songId => {
    try {
        db.execute('INSERT INTO PlayHistory (song_id) VALUES (?)', [songId]);
        return true;
    } catch (error) {
        console.error('Error adding song to history:', error);
        return false;
    }
};

export const getPlayHistory = (limit = 100) => {
    try {
        const result = db.execute(
            `SELECT s.*, ph.played_at 
       FROM Songs s 
       INNER JOIN PlayHistory ph ON s.id = ph.song_id 
       ORDER BY ph.played_at DESC 
       LIMIT ?`,
            [limit],
        );
        return result.rows?._array || result.rows || [];
    } catch (error) {
        console.error('Error getting play history:', error);
        return [];
    }
};

export const clearPlayHistory = () => {
    try {
        db.execute('DELETE FROM PlayHistory');
        return true;
    } catch (error) {
        console.error('Error clearing play history:', error);
        return false;
    }
};
