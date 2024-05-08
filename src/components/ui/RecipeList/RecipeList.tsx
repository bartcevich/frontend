'use client'

import RecipeCard from '@/components/ui/RecipeCard/RecipeCard'
import styles from './RecipeList.module.scss'
import { FC, useEffect, useRef, useState } from 'react'
import { useAppSelector } from '@/store/features/hooks'
import { RecipeListDispatcher } from '@/hooks/useFavorites'
import EmptyRecipeList from './EmptyRecipeList'
import ListLoader from '../ListLoader/ListLoader'
import { ListLoadingError } from '../ListLoadingError/ListLoadingError'

const RecipeList: FC<{ dispatcher: RecipeListDispatcher }> = ({
  dispatcher,
}) => {
  const loaderRef = useRef(null)
  const { view } = useAppSelector((state) => state.recipesFeed)
  const [containerStyles, setContainerStyles] = useState<string[]>([
    styles.wrapper,
  ])

  const { recipies, loadNextPageRef, isLoading, error } = dispatcher()

  // отслеживаем скроллинг и догружаем элементы списка
  useEffect(() => {
    let observerRefValue = null

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0]
      target.isIntersecting && loadNextPageRef.current()
    })

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
      observerRefValue = loaderRef.current
    }

    return () => {
      if (observerRefValue) observer.unobserve(observerRefValue)
    }
  }, [loadNextPageRef])

  useEffect(() => {
    const newStyles = [styles.wrapper]
    if (view === 'tile') {
      newStyles.push(styles.tile)
    }
    setContainerStyles(newStyles)
  }, [view])

  return (
    <div className={styles.container}>
      {error && <ListLoadingError error={error} />}

      <div className={containerStyles.join(' ')}>
        {recipies?.length ? (
          recipies?.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              refreshListOnRemoveFromFavorites={true}
            />
          ))
        ) : (
          <EmptyRecipeList />
        )}

        {isLoading && <ListLoader />}
      </div>

      <div ref={loaderRef}></div>
    </div>
  )
}

export default RecipeList
