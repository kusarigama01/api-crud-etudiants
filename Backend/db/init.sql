CREATE TABLE etudiants (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

INSERT INTO etudiants (
    nom,
    prenom,
    age,
    email
)
VALUES (
    'Fox',
    'Sammy',
    19,
    'sammyfoxxy@gmail.com'
);