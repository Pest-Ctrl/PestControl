package com.pestcontrol.backend.repositories;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.parser.Part;
import org.springframework.data.repository.query.parser.PartTree;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Shared verification helpers for Spring Data JPA repository contracts and entity mappings.
 */
final class RepositoryTestSupport {

    private RepositoryTestSupport() {
    }

    static void assertJpaRepositoryContract(Class<?> repoClass, Class<?> expectedEntity, Class<?> expectedId) {
        assertTrue(repoClass.isInterface(), repoClass.getSimpleName() + " should be an interface");
        assertTrue(JpaRepository.class.isAssignableFrom(repoClass),
                repoClass.getSimpleName() + " should extend JpaRepository");

        ParameterizedType jpaSuper = Arrays.stream(repoClass.getGenericInterfaces())
                .filter(ParameterizedType.class::isInstance)
                .map(ParameterizedType.class::cast)
                .filter(pt -> pt.getRawType().equals(JpaRepository.class))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Missing direct JpaRepository parameterization"));

        Type[] args = jpaSuper.getActualTypeArguments();
        assertEquals(expectedEntity, args[0], "Entity generic type mismatch");
        assertEquals(expectedId, args[1], "ID generic type mismatch");
    }

    static void assertEntityTableAndId(Class<?> entityClass, String expectedTableName, String expectedIdFieldName) {
        assertNotNull(entityClass.getAnnotation(Entity.class),
                entityClass.getSimpleName() + " must be annotated with @Entity");
        Table table = entityClass.getAnnotation(Table.class);
        assertNotNull(table, entityClass.getSimpleName() + " must be annotated with @Table");
        assertEquals(expectedTableName, table.name(), "Table name mismatch");

        try {
            Field idField = entityClass.getDeclaredField(expectedIdFieldName);
            assertNotNull(idField.getAnnotation(Id.class),
                    expectedIdFieldName + " must be annotated with @Id");
        } catch (NoSuchFieldException e) {
            throw new AssertionError("Missing @Id field: " + expectedIdFieldName, e);
        }
    }

    static String getColumnName(Class<?> entityClass, String fieldName) {
        try {
            Field field = entityClass.getDeclaredField(fieldName);
            Column column = field.getAnnotation(Column.class);
            assertNotNull(column, fieldName + " should have @Column");
            return column.name();
        } catch (NoSuchFieldException e) {
            throw new AssertionError("Missing field: " + fieldName, e);
        }
    }

    static PartTree assertDerivedQueryMethod(
            Class<?> repoClass,
            Class<?> entityClass,
            String methodName,
            Class<?>[] paramTypes,
            Class<?> expectedReturnRawType,
            Class<?> expectedReturnGenericType) {
        Method method;
        try {
            method = repoClass.getMethod(methodName, paramTypes);
        } catch (NoSuchMethodException e) {
            throw new AssertionError("Missing repository method: " + methodName, e);
        }

        assertEquals(expectedReturnRawType, method.getReturnType(),
                "Unexpected return type for " + methodName);

        if (expectedReturnGenericType != null) {
            Type genericReturn = method.getGenericReturnType();
            assertTrue(genericReturn instanceof ParameterizedType,
                    methodName + " should return parameterized type");
            Type actualElementType = ((ParameterizedType) genericReturn).getActualTypeArguments()[0];
            assertEquals(expectedReturnGenericType, actualElementType,
                    "Unexpected generic element type for " + methodName);
        }

        return new PartTree(methodName, entityClass);
    }

    static void assertSortedDesc(PartTree tree, String expectedSortProperty) {
        Sort.Order order = tree.getSort().getOrderFor(expectedSortProperty);
        assertNotNull(order, "Expected sort order on property: " + expectedSortProperty);
        assertEquals(Sort.Direction.DESC, order.getDirection());
    }

    static List<String> getPropertyPaths(PartTree tree) {
        return tree.getParts().stream()
                .map(Part::getProperty)
                .map(p -> p.toDotPath())
                .toList();
    }

    static void assertListQuery(Class<?> repoClass, Class<?> entityClass, String methodName, Class<?>... paramTypes) {
        assertDerivedQueryMethod(repoClass, entityClass, methodName, paramTypes, List.class, entityClass);
    }

    static void assertOptionalQuery(Class<?> repoClass, Class<?> entityClass, String methodName, Class<?>... paramTypes) {
        assertDerivedQueryMethod(repoClass, entityClass, methodName, paramTypes, Optional.class, entityClass);
    }
}

