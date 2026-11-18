import { BookType } from './book';
import { PublicUserType } from './user';

/** Usuário listado como seguidor/seguido (dados públicos). */
export type FollowUserType = PublicUserType;

/** Livro favoritado, com a data em que foi favoritado. */
export interface FavoriteBookType extends BookType {
    FavoritedAt: Date;
}
