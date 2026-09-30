import { LandingCatalogSearchQuery } from "@events/public/catalog-search-api";
import { LandingCatalogCandidate } from "@events/public/catalog-search-api";
import { EventCatalogSearchApi } from "@events/public/catalog-search-api";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { Injectable } from "@nestjs/common";

const MAX_CANDIDATE_TAKE = 20;

@Injectable()
export class CatalogSearchApiService implements EventCatalogSearchApi {
  constructor(private readonly eventRepository: EventRepository) {}

  async searchCatalog(
    query: LandingCatalogSearchQuery,
  ): Promise<LandingCatalogCandidate[]> {
    const search = query.search.trim();
    if (!search) return [];
    const take = Math.min(Math.max(query.take, 1), MAX_CANDIDATE_TAKE);

    const rows = await this.eventRepository.searchCatalog({
      search,
      take,
      category: query.category ?? null,
    });

    return rows.map((row) => ({
      contentId: row.id,
      slug: row.slug,
      title: row.title,
      imageUrl: row.imageUrl,
      category: row.category,
      rating: row.rating,
      score: row.score,
      recency: row.createdAt,
      startDate: row.startDate,
    }));
  }
}
